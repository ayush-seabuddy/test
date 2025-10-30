const initialState = {
  searchData: null,
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SEARCH_DATA":
      return { ...state, searchData: action.payload };
    default:
      return state;
  }
};

export default searchReducer;
