# mod 
username: mod
password: M@d23M@d23.

# start frontend
npx expo start

# start backend
cd backend
nodemon server.js

# dependencies
npm install

# expo latest 
npx expo install expo@latest

# font
https://www.fontspace.com/minecraft-font-f28180

# gif
https://giphy.com

# css animation 
https://www.sliderrevolution.com/resources/css-text-animation/

# alike
1. Game creater: https://make.gamefroot.com/
2. pixil drowing app: https://www.pixilart.com/draw

# 2D pixil style pictures found in 
1. https://www.istockphoto.com/

# database framework
https://console.firebase.google.com/
im.a.cyber.student@gmail.com
TheBear01.

project_name: senior

# assets
https://ramminanimation.tumblr.com/
https://www.gameart2d.com/free-platformer-game-tileset.html

# sqlite
download extention sqlite viewer
download sqlite3

# hashing guide 
npm init -y
npm install sqlite3 express body-parser bcryptjs express-session
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('password123', salt);

# game source codes
https://www.codingnepalweb.com/best-javascript-games-for-beginners/
https://www.codewithfaraz.com/article/121/20-javascript-games-with-source-code-for-beginners --very helpfull 

# name ideas
SketchPlay

# theme
#CE55F2
rgba(206, 85, 242, 0.5)
#6441a5
fontFamily: 'Minecraft Regular'
import CustomText from './CustomText';

# publish 

eas update --branch production --message "First Publish"

# each page

<TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
        <CustomText style={styles.backButtonText}>&lt;</CustomText>
</TouchableOpacity>


  backButton: {
    left: 20,
    top: 50,
    width: 110,
    height: 110,
    position: 'absolute',
  },
  backButtonText: {
        color: '#ffffff',
        fontSize: 35,
  },


import { useNavigate, useParams } from 'react-router-native';

const navigate = useNavigate();


    <Image source={require('./assets/treasure.gif')} style={styles.Image} />

    Image: {
    width: 100, 
    height: 100, 
    resizeMode: 'contain',
    marginTop: 170,
    opacity: 0.5, 
},


const handleImageError = () => {
    setImageSource(require('./assets/profile.png')); // Fallback to default image
};

import { Image } from 'expo-image';

import API_ENDPOINTS from './api';

const { profileData, imageSource, handleImageError } = useProfile();

import useProfile from './get_session';

