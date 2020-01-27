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

const outlines = [
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

async function generateItem(outline, keys, locale, options) {
  const item = {
    slug: '',
    title: '',
    items: [],
  };

  const slug =
    locale === options.localeConfig.locales[0].value
      ? ['', ...keys, outline.key, ''].join('/')
      : ['', locale, ...keys, outline.key, ''].join('/');
  const res = await options.graphql(
    `
      query GetPost($slug: String) {
        allMarkdownRemark(filter: { fields: { slug: { eq: $slug } } }) {
          edges {
            node {
              frontmatter {
                title
              }
            }
          }
        }
      }
    `,
    { slug },
  );
  const post = res.data.allMarkdownRemark.edges[0];
  const title = post.node.frontmatter.title;

  item.slug = slug;
  item.title = title;
  if (outline.items.length) {
    for (let i = 0; i < outline.items.length; i += 1) {
      const res = await generateItem(outline.items[i], [...keys, outline.key], locale, options);
      item.items.push(res);
    }
  }

  return item;
}

async function generateSummary(outlines, options) {
  const summary = {};
  for (let i = 0; i < options.localeConfig.locales.length; i += 1) {
    const locale = options.localeConfig.locales[i].value;
    summary[locale] = [];

    for (let j = 0; j < outlines.length; j += 1) {
      const res = await generateItem(outlines[j], [], locale, options);
      summary[locale].push(res);
    }
  }
  return summary;
}

function extractPath(slug) {
  const slugArray = slug.split('/').filter(path => !!path);
  const lastPath = slugArray[slugArray.length - 1];
  const lastPathArray = lastPath.split('.');

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
  const summary = await generateSummary(outlines, { localeConfig, graphql });

  // TODO: outlineからpageをgenerateしたほうがいいな
  posts.forEach((post, index) => {
    const locale = post.node.fields.locale;
    const slug = post.node.fields.slug;
    const slugArray = slug.split('/').filter(path => !!path);
    const keys = slugArray.slice();
    keys[0] === locale ? keys.shift() : null;

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        locale,
        slug,
        summary,
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
