import React, { useState } from "react";
import { SocialIcon } from "react-native-elements";
import { View } from "react-native";
import * as Facebook from "expo-facebook";
import * as firebase from "firebase";
import { FacebookApi } from "../../utils/Social";
import Loading from "../Loading";

export default function LoginFacebook(props) {
  const { toastRef, navigation } = props;
  const [isVisibleLoading, setIsVisibleLoading] = useState(false);

  const login = async () => {
    try {
      await Facebook.initializeAsync(FacebookApi.application_id);
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: FacebookApi.permission
      });

      if (type === "success") {
        setIsVisibleLoading(true);
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}`
        );

        const credentials = firebase.auth.FacebookAuthProvider.credential(
          token
        );
        await firebase
          .auth()
          .signInWithCredential(credentials)
          .then(async () => {
            toastRef.current.show(
              "Bienvenido!",
              `Hola ${await response.json().name}!`
            );
            navigation.navigate("MyAccount");
          })
          .catch(({ message }) => {
            toastRef.current.show(`Facebook Login Error: ${message}`);
          });
        setIsVisibleLoading(false);
      } else if (type === "cancel") {
        toastRef.current.show("Inicio de sesion cancelado");
      } else {
        toastRef.current.show("Error desconocido");
      }
    } catch ({ message }) {
      toastRef.current.show(`Facebook Login Error: ${message}`);
    }
  };
  return (
    <View>
      <SocialIcon
        title="Iniciar sesión con Facebook"
        button
        type="facebook"
        onPress={login}
      />
      <Loading text="Ingresando vía Facebook" isVisible={isVisibleLoading} />
    </View>
  );
}
