module.exports = {
  siteMetadata: {
    title: "Crammond Tides",
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
