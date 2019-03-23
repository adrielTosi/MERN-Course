import {
  ADD_POST,
  GET_POSTS,
  POST_LOADING,
  DELETE_POST
} from "../actions/types";

const initialStatePost = {
  posts: [],
  post: {},
  loading: false
};

export default function(state = initialStatePost, action) {
  switch (action.type) {
    case POST_LOADING:
      return {
        ...state,
        loading: true
      };
    case GET_POSTS:
      return {
        ...state,
        posts: action.payload,
        loading: false
      };
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      };
    case DELETE_POST:
      const newPosts = state.posts.filter(post => post._id !== action.payload);
      return {
        ...state,
        posts: newPosts
      };
    default:
      return state;
  }
}
