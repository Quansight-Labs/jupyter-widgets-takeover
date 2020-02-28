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
import * as React from "react";

const MIME_TYPE = "application/x.jupyterlab.workspace+json";

function Component({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <button onClick={() => onClick()}>Set workspace</button>
    </div>
  );
}

class OutputWidget extends ReactWidget implements IRenderMime.IRenderer {
  constructor(
    private readonly options: {
      state: IStateDB;
      restorer: ILayoutRestorer;
      labShell: ILabShell;
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
    const { state } = this.options;

    // update state db
    for (const [k, v] of Object.entries(this.workspaceData)) {
      await state.save(k, v as any);
    }
    // trigger layout change
    const restorer = this.options.restorer as LayoutRestorer;
    const layout = await restorer.fetch();
    this.options.labShell.restoreLayout(layout);
  }

  private workspaceData = {};
}

/**
 * Initialization data for the jupyter-widgets-takeover extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: "jupyter-widgets-takeover:workspace",
  autoStart: true,
  requires: [IRenderMimeRegistry, ILabShell, IStateDB, ILayoutRestorer],

  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    labShell: ILabShell,
    state: IStateDB,
    restorer: ILayoutRestorer
  ) => {
    rendermime.addFactory({
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: () => new OutputWidget({ state, restorer, labShell })
    });
  }
};

export default extension;
