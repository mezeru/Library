const { query } = require('express');
const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {GraphQLObjectType,GraphQLString,GraphQLSchema,GraphQLList, GraphQLInt, GraphQLNonNull} = require('graphql');
const App = express();

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const bookType = new GraphQLObjectType({
    name:"book",
    description:"this is a book",
    fields:() => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name:{type: GraphQLNonNull(GraphQLString)},
        authorId:{type: GraphQLNonNull(GraphQLInt)},
        aurthor:{
            type: authorType,
            resolve: (book) =>  {
                return authors.find(author => author.id == book.id)
            }
        }
    })
}) 

const authorType = new GraphQLObjectType({
    name:"author",
    description:"authors of book",
    fields:() =>({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name:{type: GraphQLNonNull(GraphQLString)},
        books:{
            type: GraphQLList(bookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name:'query',
    description:'Root Query',
    fields: () => ({
        author:{
            type: authorType,
            description: "A single Author",
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args) => {
               return authors.find(author => author.id === args.id)
            }
        },
        book:{
            type: bookType,
            description: "A single book",
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent,args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books:{
            type: new GraphQLList(bookType),
            description:"List of All Books",
            resolve: () => books
        },
        authors:{
            type: new GraphQLList(authorType),
            description:"list of all Authors",
            resolve: () => authors
        }
    }) 
})

const rootMutationType = new GraphQLObjectType({
    name:"mutation",
    description:"Root Mutation",
    
    fields:() =>({
        addbook:{
            type: bookType,
            description:"add books",
            args:{
                name:{type: GraphQLNonNull(GraphQLString)},
                authorId:{type:GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args) =>{
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book);
                return book;
            }
        },
        addauthor:{
                type: authorType,
                description:"add Author",
                args:{
                    name:{type: GraphQLNonNull(GraphQLString)},
                    id:{type:GraphQLNonNull(GraphQLInt)}
                },
                resolve: (parent,args) =>{
                    const author = {
                        name: args.name,
                        id: args.id
                    }
                    authors.push(author);
                    return author;
                }
        }
            
        
    })
})

const schema = new GraphQLSchema({
    query:rootQueryType,
    mutation:rootMutationType
})

App.use('/gql',graphqlHTTP({
    schema:schema,
    graphiql: true
}))

App.listen(5000,()=>{
    console.log("Server Running...");
});