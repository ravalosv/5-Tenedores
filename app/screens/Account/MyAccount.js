import React, { useState, useEffect } from "react";
import Loading from "../../components/Loading";
import * as firebase from "firebase";
import UserGuest from "./UserGuest";
import UserLogged from "./UserLogged";

function MyAccountScreen() {
  const [login, setLogin] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      !user ? setLogin(false) : setLogin(true);
    });
  }, []);

  // return <Loading isVisible={true} text="Cargando..." />;

  if (login === null) {
    return <Loading isVisible={true} text="Cargando..." />;
  }

  return login ? <UserLogged /> : <UserGuest />;
}

export default MyAccountScreen;
