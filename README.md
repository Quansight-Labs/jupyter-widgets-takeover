# jupyter-widgets-takeover

![Github Actions Status](https://github.com/my_name/myextension/workflows/Build/badge.svg)

Let your widgets takeover your JupyterLab!

This extension is an *experiment* on how you can control your JupyterLab layout from Python.



Check out the `Demo.ipynb`.


## Requirements

* JupyterLab >= 1.0

## Install

```bash
jupyter labextension install jupyter-widgets-takeover @jupyter-widgets/jupyterlab-manager
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jupyter-widgets-takeover directory
# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension install . @jupyter-widgets/jupyterlab-manager
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

### Uninstall

```bash
jupyter labextension uninstall jupyter-widgets-takeover
```

