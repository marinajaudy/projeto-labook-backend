import { PostsDatabase } from "../database/PostsDataBase"
import { PostDTO } from "../dtos/PostDTO"
import { BadRequestError } from "../errors/BadRequestError"
import { NotFoundError } from "../errors/NotFoundError"
import { Post } from "../models/Post"
import { TPostsDB } from "../types"

export class PostBusiness {
    constructor(
        private postsDatabase: PostsDatabase
    ){}

    public getPosts = async (q: string | undefined) =>{

            const postsDatabase = new PostsDatabase()
            const postsDB: TPostsDB[] = await postsDatabase.findPosts(q)
    
            const posts: Post[] = postsDB.map((postDB) => new Post(
                postDB.id,
                postDB.creator_id,
                postDB.content,
                postDB.likes,
                postDB.dislikes,
                postDB.created_at,
                postDB.updated_at
            ))

            //const finalPost = await postsDatabase()

            return posts
    }

    public createPost = async (input:any) => {

        const { id, creatorId, content } = input
    
            
            const postDBExist = await this.postsDatabase.findPostById(id)
            
            if (postDBExist) {
                throw new BadRequestError("'id' já existe")
            }
    
            let newLikes = 0
            let newDislikes = 0

            //1 - INSTANCIAR os dodos vindos do body
            const newPost = new Post(
                id,
                creatorId,
                content,
                newLikes,
                newDislikes,
                new Date().toISOString(),               
                new Date().toISOString()
            )
    
            //2 - Objeto simples para MODELAR as informações para o banco de dados
            const newPostDB: TPostsDB = {
                id: newPost.getIdPost(),
                creator_id: newPost.getCreatorIdPost(),
                content: newPost.getContentPost(),
                likes: newPost.getLikesPost(),
                dislikes: newPost.getDislikesPost(),
                created_at: newPost.getCreatedAtPost(),
                updated_at: newPost.getUpdatedAtPost()
            }
  
            await this.postsDatabase.insertPost(newPostDB)

            const postDTO = new PostDTO()
            const output = postDTO.createPostOutput(newPost)

            return output
    }

    public editPost = async (input: any) => {

        const {idToEdit, content } = input

        if (typeof idToEdit !== "string") {
            
            throw new BadRequestError("'id' deve ser string")
        }

        if (typeof content !== "string") {
            
            throw new BadRequestError("'title' deve ser string")
        }

        const postsDB = await this.postsDatabase.findPostById(idToEdit)

        if (!postsDB) {
            
            throw new NotFoundError("'id' não encontrado")
        }

        if(postsDB){
            //1 - INSTANCIAR os dodos vindos do body
            const newPost = new Post(
                idToEdit,
                postsDB.creator_id,
                content,
                postsDB.likes,
                postsDB.dislikes,
                postsDB.created_at,
                new Date().toISOString()
            )
    
            //2 - Objeto simples para MODELAR as informações para o banco de dados
            const newPostDB: TPostsDB = {
                id: newPost.getIdPost(),
                creator_id: newPost.getCreatorIdPost(),
                content: newPost.getContentPost(),
                likes: newPost.getLikesPost(),
                dislikes: newPost.getDislikesPost(),
                created_at: newPost.getCreatedAtPost(),
                updated_at: newPost.getUpdatedAtPost()
            }
    
            newPost.setContentPost(newPostDB.content)

            await this.postsDatabase.updatePostById(newPostDB)

            return ({
                message: "Post editado com sucesso",
                video: newPost
            })
    }


    }

    public deletePost = async (id: string) =>{
        
            const postExist = await this.postsDatabase.findPostById(id)
    
            if (!postExist) {
               
                throw new NotFoundError("Id não encontrado")
            }
    
            await this.postsDatabase.deletePost(id)

            return ({
                    message: "Post deletado com sucesso"
            })
            
    }

}