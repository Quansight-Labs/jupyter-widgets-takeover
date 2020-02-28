import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  LayoutRestorer
} from "@jupyterlab/application";
import { ReactWidget } from "@jupyterlab/apputils";
import { IRenderMimeRegistry } from "@jupyterlab/rendermime";
import { IRenderMime } from "@jupyterlab/rendermime-interfaces";
import { IStateDB } from "@jupyterlab/statedb";
import { PromiseDelegate } from "@lumino/coreutils";
import * as React from "react";
import { IPyWidgetTracker } from "./widgets";
import { Widget } from "@lumino/widgets";

const MIME_TYPE = "application/x.jupyterlab.workspace+json";

function Component({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <button onClick={() => onClick()}>Set workspace</button>
    </div>
  );
}

export type TrackerRestorer = {
  namespace: string;
  command: string;
};

class OutputWidget extends ReactWidget implements IRenderMime.IRenderer {
  constructor(
    private readonly options: {
      state: IStateDB;
      restorer: ILayoutRestorer;
      labShell: ILabShell;
      trackerRestorers: Array<TrackerRestorer>;
      app: JupyterFrontEnd;
    }
  ) {
    super();
  }

  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    this.workspaceData = model.data[MIME_TYPE];
  }

  render() {
    return <Component onClick={() => this.onClick()} />;
  }

  async onClick() {
    const { state, labShell, app, trackerRestorers, restorer } = this.options;

    for (const [k, v] of Object.entries(this.workspaceData)) {
      await state.save(k, v as any);
    }

    const first = new PromiseDelegate<void>();
    const newRestorer = new LayoutRestorer({
      connector: state,
      first: first.promise,
      registry: app.commands
    });
    const layoutPromise = (newRestorer as LayoutRestorer).fetch();

    // Copies logic in restoreablepool restore
    for (const { namespace, command } of trackerRestorers) {
      const results = await state.list(namespace);
      for (const [index, id] of results.ids.entries()) {
        const value = results.values[index];
        await state.remove(id);
        const args = (value as any).data;
        await app.commands.execute(command, args);
      }
    }
    // copy all widgets from old to new, b/c they will have been added to old
    // by tracker on old

    for (const [name, widget] of ((restorer as any)._widgets as Map<
      string,
      Widget
    >).entries()) {
      ((newRestorer as any)._widgets as Map<string, Widget>).set(name, widget);
    }

    first.resolve();
    const layout = await layoutPromise;
    labShell.restoreLayout(layout);
    if (this.workspaceData.hide) {
      (labShell as any)._leftHandler._sideBar.hide();
      (labShell as any)._rightHandler._sideBar.hide();
      (labShell as any)._topHandler.panel.hide();
      (labShell as any)._bottomPanel.hide();
    }
  }

  private workspaceData: any = {};
}

/**
 * Initialization data for the jupyter-widgets-takeover extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: "jupyter-widgets-takeover:workspace",
  autoStart: true,
  requires: [
    IRenderMimeRegistry,
    ILabShell,
    IStateDB,
    ILayoutRestorer,
    IPyWidgetTracker
  ],

  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    labShell: ILabShell,
    state: IStateDB,
    restorer: ILayoutRestorer,
    ipywidgetTracker: IPyWidgetTracker
  ) => {
    rendermime.addFactory({
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: () =>
        new OutputWidget({
          app,
          state,
          restorer,
          labShell,
          trackerRestorers: [ipywidgetTracker]
        })
    });
  }
};

export default extension;
