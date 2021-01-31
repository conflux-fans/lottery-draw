/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: `Conflux`,
    description: `conflux lottery.`,
    author: `conflux`,
    siteUrl: `https://confluxnetwork.org`,
  },

  plugins: [
    /**
     * Eslint hot load
     */
    `gatsby-plugin-eslint`,

    /**
     * Less support
     */
    `gatsby-plugin-less`,

    /**
     * Helmet for SEO
     */
    `gatsby-plugin-react-helmet`,

    /**
     * Make all image file can query
     */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src`,
      },
    },
    /**
     * Manifest
     */
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Conflux Website`,
        short_name: `conflux`,
        start_url: `/`,
        background_color: `#7c426d`,
        theme_color: `#7c426d`,
        display: `standalone`,
        icon: `src/images/logo-icon.png`, // This path is relative to the root of the site.
      },
    },

    /**
     * Parses Markdown files using Remark.
     */
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {},
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
            },
          },
          // Adds syntax highlighting to code blocks in markdown files
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },

    /**
     * Optimize images for production
     */
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,

    /**
     * Google Analytics
     */
    // {
    //   resolve: `gatsby-plugin-google-analytics`,
    //   options: {
    //     trackingId: 'UA-142778411-1',
    //   },
    // },

    /**
     * Baidu Tongji for production
     */
    // {
    //   resolve: 'gatsby-plugin-baidu-tongji',
    //   options: {
    //     siteid: '4dd121dde4ccc8928cb6ec5ea9b2f9ba',
    //     head: false,
    //   },
    // },

    /**
     * Create a sitemap
     */
    `gatsby-plugin-sitemap`,
  ],
}
