import { connect } from "react-redux";
import App from "../App";

const mapStateToProps = (state) => ({
  message: state.message, // Redux state available to App if needed
});

const Game = connect(mapStateToProps)(App);

export default Game;
