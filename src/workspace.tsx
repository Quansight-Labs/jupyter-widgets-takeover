import {
  IRouter,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";
import { ReactWidget } from "@jupyterlab/apputils";
import { URLExt } from "@jupyterlab/coreutils";
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
      app: JupyterFrontEnd;
      router: IRouter;
      state: IStateDB;
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
    const { app, router } = this.options;

    const workspaceName = "my-notebook";
    const id = `/lab/workspaces/${workspaceName}`;
    await app.serviceManager.workspaces.save(id, {
      data: this.workspaceData,
      metadata: { id }
    });

    router.navigate(URLExt.objectToQueryString({ clone: workspaceName }), {
      hard: true
    });
  }

  private workspaceData = {};
}

/**
 * Initialization data for the jupyter-widgets-takeover extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: "jupyter-widgets-takeover:workspace",
  autoStart: true,
  requires: [IRenderMimeRegistry, IRouter, IStateDB],

  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    router: IRouter,
    state: IStateDB
  ) => {
    rendermime.addFactory({
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: () => new OutputWidget({ app, router, state })
    });
  }
};

export default extension;
