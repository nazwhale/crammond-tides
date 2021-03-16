module.exports = {
  siteMetadata: {
    title: "Crammond Tide Checker",
    siteUrl: `https://www.crammondtides.netlify.app`,
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "265834876",
      },
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    "@chakra-ui/gatsby-plugin",
  ],
};
