import loadable from 'loadable-components';

export const LoadableTop = loadable(
  () => import(/* webpackChunkName: "Top" */ '../containers/Top').then(({ Top }) => Top),
  {
    modules: ['../containers/Top']
  }
);

export const LoadableNotFound = loadable(
  () =>
    import(/* webpackChunkName: "404", webpackPrefetch: true */ '../containers/NotFound').then(
      ({ NotFound }) => NotFound
    ),
  {
    modules: ['../containers/NotFound']
  }
);
