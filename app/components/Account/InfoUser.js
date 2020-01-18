import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-elements";
import * as firebase from "firebase";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
// import UseCamera from "../Account/UseCamera";

export default function InfoUser(props) {
  const {
    userInfo: { uid, displayName, photoURL, providerId, email },
    setReloadData,
    toastRef,
    setIsLoading,
    setTextLoading
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
    setTextLoading("Actualizando Avatar");
    setIsLoading(true);
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

        setIsLoading(false);
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
        // onEditPress={navigation.navigate("UseCamera")}
        containerStyle={styles.userInfoAvatar}
        source={{
          uri: newPhotoURL
            ? newPhotoURL
            : "https://api.adorable.io/avatars/128/AnaIsabelOrtegaValencia"
        }}
      />
      <View style={styles.displayName}>
        <Text style={styles.displayName}>
          {displayName ? displayName : "Anónimo1"}
        </Text>
        <Text>{email ? email : "Social Login"}</Text>
      </View>
    </View>
  );
}

// function UseCamera(props) {
//   const { hasPermission, type } = props;

//   console.log("USE CAMERA");

//   if (hasPermission === null) {
//     return <View />;
//   }
//   if (hasPermission === false) {
//     return <Text>No access to camera</Text>;
//   }
//   return (
//     <View style={{ flex: 1 }}>
//       <Camera style={{ flex: 1 }} type={type}>
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "transparent",
//             flexDirection: "row"
//           }}
//         >
//           <TouchableOpacity
//             style={{
//               flex: 0.1,
//               alignSelf: "flex-end",
//               alignItems: "center"
//             }}
//             onPress={() => {
//               setType(
//                 type === Camera.Constants.Type.back
//                   ? Camera.Constants.Type.front
//                   : Camera.Constants.Type.back
//               );
//             }}
//           >
//             <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
//               {" "}
//               Flip{" "}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </Camera>
//     </View>
//   );
// }

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
