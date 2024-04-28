const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async () => {
            return User.find()
        }
    },

    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!profile) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(profile);
            return { token, profile };
        },
        addUser: async (parent, {username, password, email}) => {
            const profile = await User.create({ username, email, password})
            const token = signToken(profile);

            return { token, profile };
        },
        saveBook: async (parent, {book}, context) => {
            const { user } = context;

            //Check if the user is logged in
            if (!user) {
                throw new AuthenticationError('You must be logged in to save a book')
            }

            try {
                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    // Add the book to the savedBooks array
                    {$push: {savedBooks: book} },
                    {new: true }
                );

                return updatedUser;
            } catch ( error ) {
                console.error('Error saving book:', error);
                throw new Error('Failed to save book, please try again')
            }
        },
        removeBook: async (parent, { bookId }, context) => {
            const { user } = context;

            //Check if the user is logged in
            if (!user) {
                throw new AuthenticationError('You must be logged in to remove this book')
            }

            try {
                const index = user.savedBooks.findIndex(book => book.bookId === bookId)

                if (index === -1) {
                    throw new Error ('Book not found in users saved books')
                }

                //Remove the book from the savedBooks array
                user.savedBooks.splice(index, 1);

                //Save the updated user object
                await user.save();
            } catch (error) {
                console.error('Error removing book:', error);
                throw new Error('Failed to remove book.  Please try again');
            }
        }
    },
};

module.exports = resolvers;