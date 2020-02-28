import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  LayoutRestorer
} from "@jupyterlab/application";
import { ReactWidget, WidgetTracker } from "@jupyterlab/apputils";
import { IRenderMimeRegistry } from "@jupyterlab/rendermime";
import { IRenderMime } from "@jupyterlab/rendermime-interfaces";
import { IRestorer, IStateDB } from "@jupyterlab/statedb";
import { PromiseDelegate } from "@lumino/coreutils";
import { Widget } from "@lumino/widgets";
import * as React from "react";
import { IPyWidgetTracker } from "./widgets";

const MIME_TYPE = "application/x.jupyterlab.workspace+json";

function Component({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <button onClick={() => onClick()}>Set workspace</button>
    </div>
  );
}

export type TrackerRestorer<T extends Widget> = {
  tracker: WidgetTracker<T>;
  restorerOptions: IRestorer.IOptions<T>;
};

class OutputWidget extends ReactWidget implements IRenderMime.IRenderer {
  constructor(
    private readonly options: {
      state: IStateDB;
      restorer: ILayoutRestorer;
      labShell: ILabShell;
      trackerRestorers: Array<TrackerRestorer<any>>;
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
    const { state, labShell, restorer, app, trackerRestorers } = this.options;

    for (const [k, v] of Object.entries(this.workspaceData)) {
      await state.save(k, v as any);
    }

    const first = new PromiseDelegate<void>();
    const newRestorer = new LayoutRestorer({
      connector: state,
      first: first.promise,
      registry: app.commands
    });
    const layoutPromise = (restorer as LayoutRestorer).fetch();
    for (const { tracker, restorerOptions } of trackerRestorers) {
      await newRestorer.restore(tracker, restorerOptions);
    }
    first.resolve();
    labShell.restoreLayout(await layoutPromise);
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
