import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
    IRouter
  } from "@jupyterlab/application";
  import { IRenderMimeRegistry } from "@jupyterlab/rendermime";
  import { IRenderMime } from "@jupyterlab/rendermime-interfaces";
  import { URLExt } from "@jupyterlab/coreutils";
  // import { Workspace } from "@jupyterlab/services";
  import { IStateDB } from "@jupyterlab/statedb";
  import { ReactWidget } from "@jupyterlab/apputils";
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
      this.node.innerHTML;
    }
    /**
     * Render typez-graph into this widget's node.
     */
    async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
      this.workspaceData = model.data[MIME_TYPE];
  
      // }
      // app.commands.execute("apputils:reset-on-load", args);
      // }
    }
  
    render() {
      return <Component onClick={() => this.onClick()} />;
    }
  
    async onClick() {
      const { app, router } = this.options;
  
      // console.log("overwriting", state, workspaceData);
      // (state as any)._overwrite(workspaceData)
      // app.serviceManager.sta
      const workspaceName = "my-notebook";
      const id = `/lab/workspaces/${workspaceName}`;
      // const workspaceName = `random-${Math.random().toString(36)}`;
      // await app.serviceManager.workspaces.remove(id);
      await app.serviceManager.workspaces.save(id, {
        data: this.workspaceData,
        metadata: { id }
      });
      // console.log(router.current);
      // const args: IRouter.ILocation = {
      //   hash: "",
      //   path: "",
      //   request: "",
      //   search: URLExt.objectToQueryString({ clone: workspaceName, reset: true })
      // };
      //
      // model.setData({ data: {} });
      // model.
      // if (router.current.path !== id) {
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
  
  // import { ReactWidget } from "@jupyterlab/apputils";
  // import { IRenderMime } from "@jupyterlab/rendermime-interfaces";
  // import * as React from "react";
  // import GraphComponent from "./GraphComponent";
  // import { Typez } from "./schema";
  
  // /**
  //  * The default mime type for the extension.
  //  */
  
  // /**
  //  * Extension definition.
  //  */
  // const extension: IRenderMime.IExtension = {
  //   id: "typez-graph:plugin",
  //   rendererFactory,
  //   // So it renders before JSON
  //   rank: -10,
  //   dataType: "json",
  //   fileTypes: [
  //     {
  //       name: "typez-graph",
  //       mimeTypes: [MIME_TYPE],
  //       extensions: ["typez.json"]
  //     }
  //   ],
  //   documentWidgetFactoryOptions: {
  //     name: "typez viewer",
  //     primaryFileType: "typez-graph",
  //     fileTypes: ["typez-graph"],
  //     defaultFor: ["typez-graph"]
  //   }
  // };
  // export default extension;
  