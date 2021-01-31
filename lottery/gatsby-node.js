exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /@cfxjs\/react-hooks/,
            use: loaders.null(),
          },
        ],
      },
    });
  }
};
