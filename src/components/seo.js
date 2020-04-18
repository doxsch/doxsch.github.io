/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import Helmet from "react-helmet"
import {useStaticQuery, graphql} from "gatsby"

function SEO({ title }) {
    const {github: {viewer: {name, login, bio, url}}} = useStaticQuery(
        graphql`
            query {
                github {
                    viewer {
                        name
                        login
                        bio
                        url
                    }
                }
            }
        `
    )
    const siteTitle = title ? name ? name + ' | ' + title : login + ' | ' + title : name ? name : login
    return (
        <Helmet
            htmlAttributes={{
                lang: 'en'
            }}
            title={siteTitle}
            meta={[{name: 'description', content: bio +' - ' + url}]}
        />
    )
}

export default SEO
