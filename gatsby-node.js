const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `
  ).then(result => {
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.fields.slug,
        component: path.resolve(`./src/templates/postTemplate.js`),
        context: {
          slug: node.fields.slug,
          date: node.fields.postDate,
        },
      })
    })
  })
}

/* Fetch external images in yaml files */
const {createRemoteFileNode} = require("gatsby-source-filesystem");

exports.createSchemaCustomization = ({ actions }) => {
  const {createTypes} = actions;

  createTypes(`
    type DataYaml implements Node {
      topics: [Topic]
    }

    type Topic {
      name: String!
      web_url: String
      image_url: String
      image: File @link(from: "image___NODE")
    }
  `)
}


exports.onCreateNode = async ({
                                node,
                                getNode,
                                actions: { createNode, createNodeField },
                                store,
                                cache,
                                createNodeId,
                              }) => {
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `posts` })
    const [postYear, postMonth, postDay, ...fileNames] = (slug.replace('/', '')).split('-')
    const fileName = fileNames.join('-')
    createNodeField({
      node,
      name: `slug`,
      value: `/${postYear}/${postMonth}/${postDay}/${fileName}`,
    })
    createNodeField({
      node,
      name: `postDate`,
      value: `${postYear}-${postMonth}-${postDay}`,
    })
  }


  // For all MarkdownRemark nodes that have a featured image url, call createRemoteFileNode
  if(node.topics) {
    for(let i = 0; i < node.topics.length; i++ ){
      if (

          node.internal.type === "DataYaml" &&
          node.topics[i].image_url !== null
      ) {
        let fileNode = await createRemoteFileNode({
          url: node.topics[i].image_url, // string that points to the URL of the image
          parentNodeId: node.id, // id of the parent node of the fileNode you are going to create
          createNode, // helper function in gatsby-node to generate the node
          createNodeId, // helper function in gatsby-node to generate the node id
          cache, // Gatsby's cache
          store, // Gatsby's redux store
        })

        // if the file was created, attach the new node to the parent node
        if (fileNode) {
          node.topics[i].image___NODE = fileNode.id
        }
      }
    }
  }

}
