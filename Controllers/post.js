const Post = require("../Models/post");


const getPosts  = (req, res) => {

}

const getPost  = (req, res) => {

}


const createPost  = (req, res) => {

    const {
        title, 
        content,
        author
    } = req.body

    Post.create({
        title,
        content,
        author
    }).then((response) => {

        console.log(response.populated("author"))
        res.status(200).send({
            post : response
        })

    
    }).catch((err) => {
        res.status(200).send({
            message : "Something went wrong",
            err
        })
    })

}
const updatePost  = (req, res) => {

}
const deletePost  = (req, res) => {

}



module.exports = {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
}