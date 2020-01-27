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

const summary = [
  // FYI: key is dir path. It's for order of sidebar
  {
    key: 'welcome',
    items: [
      {
        key: 'part1',
        items: [],
      },
      {
        key: 'part2',
        items: [],
      },
    ],
  },
  {
    key: 'onboarding',
    items: [
      {
        key: 'part1',
        items: [],
      },
      {
        key: 'part2',
        items: [],
      },
    ],
  },
];

function extractPath(slug) {
  const slugArray = slug.split('/').filter(path => !!path);
  const lastPath = slugArray[slugArray.length - 1];
  const lastPathArray = lastPath.split('.');

  // TODO: Make following line flexible
  const locale = lastPathArray[lastPathArray.length - 1];
  slugArray.splice(slugArray.length - 1, 1, lastPath.replace(`.${locale}`, '').replace(/^index/, ''));
  if (locale !== localeConfig.locales[0].value) {
    slugArray.unshift(locale);
  }
  slugArray.unshift('');
  const path = slugArray.join('/') || '/';

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
    // TODO: Update prev and next
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    const locale = post.node.fields.locale;
    const slug = post.node.fields.slug;
    const slugArray = slug.split('/').filter(path => !!path);
    const keys = slugArray.slice();
    keys[0] === locale ? keys.shift() : null;
    console.log(keys);

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
