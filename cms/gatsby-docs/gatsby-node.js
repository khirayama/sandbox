const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

const localeConfig = {
  locales: [
    {
      value: 'en',
      label: 'English',
    },
    {
      value: 'ja',
      label: '日本語',
    },
  ],
};

function extractPath(slug) {
  const slugArray = slug.split('/').filter(path => !!path);
  const lastPath = slugArray[slugArray.length - 1];
  const lastPathArray = lastPath.split('.');
  // TODO: Make following line flexible
  const locale = lastPathArray[lastPathArray.length - 1];
  slugArray.splice(slugArray.length - 1, 1, lastPath.replace(`.${locale}`, ''));
  slugArray.unshift('', locale);
  slugArray.push('');
  const path = slugArray.join('/');

  return {
    locale,
    path,
  };
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPost = path.resolve(`./src/templates/blog-post.js`);
  const result = await graphql(
    `
      {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }, limit: 1000) {
          edges {
            node {
              fields {
                locale
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `,
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    const { path, locale } = extractPath(value);
    createNodeField({
      name: `slug`,
      node,
      value: path,
    });
    createNodeField({
      name: `locale`,
      node,
      value: locale,
    });
  }
};
