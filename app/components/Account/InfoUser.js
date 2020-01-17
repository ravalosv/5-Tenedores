import React from "react";
import { StyleSheet, View, Text, ScrollView, Image } from "react-native";
import { Avatar } from "react-native-elements";
import * as firebase from "firebase";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";

export default function InfoUser(props) {
  const {
    userInfo: { uid, displayName, photoURL, providerId, email },
    setReloadData,
    toastRef
  } = props;

  const newPhotoURL =
    providerId === "facebook.com" ? photoURL + "?type=large" : photoURL;

  const changeAvatar = async () => {
    /*
      PAra que funcione en android la solicitud de permisos se debe modificar app.json
      Agregar las siguientes lineas:
      
      "android": {
            "permissions": ["CAMERA_ROLL"]
        }

      */
    const resultPermissionCamera = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );
    const resultPermission =
      resultPermissionCamera.permissions.cameraRoll.status;

    console.log("resultPermission", resultPermission);

    if (resultPermission === "denied") {
      toastRef.current.show("Es necesario aceptar los permisos de la galería");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3]
      });

      if (result.cancelled) {
        toastRef.current.show("Has cerrado la galería de imagenes");
      } else {
        uploadImage(result.uri, uid).then(() => {
          updatePhotoUrl(uid);
        });
      }
    }
  };

  const uploadImage = async (uri, nameImage) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const ref = firebase
      .storage()
      .ref()
      .child(`avatar/${nameImage}`);
    return ref.put(blob);
  };

  const updatePhotoUrl = uid => {
    firebase
      .storage()
      .ref(`avatar/${uid}`)
      .getDownloadURL()
      .then(async result => {
        const update = {
          photoURL: result
        };
        await firebase.auth().currentUser.updateProfile(update);
        setReloadData(true);
      })
      .catch(() => {
        toastRef.current.show("Error al recuperar el avatar del servidor.");
      });
  };

  return (
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="large"
        showEditButton
        onEditPress={changeAvatar}
        containerStyle={styles.userInfoAvatar}
        source={{
          uri: newPhotoURL
            ? newPhotoURL
            : "https://api.adorable.io/avatars/128/AnaIsabelOrtegaValencia"
        }}
      />
      <View style={styles.displayName}>
        <Text style={styles.displayName}>
          {displayName ? displayName : "Anónimo"}
        </Text>
        <Text>{email ? email : "Social Login"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingTop: 30,
    paddingBottom: 30
  },
  userInfoAvatar: {
    marginRight: 20
  },
  displayName: {
    fontWeight: "bold"
  }
});
