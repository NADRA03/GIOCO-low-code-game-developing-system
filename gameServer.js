import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard, 
  ScrollView, 
  Text, 
  Animated,
  ImageBackground,
  Image 
} from 'react-native';
import io from 'socket.io-client';
import CustomText from './CustomText';
import axios from 'axios';
import API_ENDPOINTS, { API_BASE_URL } from './api';
import { useParams } from 'react-router-dom';
import useGameDetails from "./game_helpers";  
import { useNavigate } from 'react-router-native';

const GameServer = () => {
  const [comments, setComments] = useState([]);
  const [topPlayer, setTopPlayer] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const { id, admin } = useParams();
  const isAdmin = admin === 'true'; 
  const scrollViewRef = useRef(null);
  const navigate = useNavigate();
  const { gameData, imageSource, handleImageError } = useGameDetails(id);
   
  // Socket connection and listener
  useEffect(() => {
    // Connect socket only once
    const socket = io(API_BASE_URL);

    // Listen for new comments
    socket.on('new_comment', (comment) => {
        console.log('Received new comment for game', id, 'via socket:', comment);
        if (comment.gameId === id) {
          setComments((prevComments) => [comment, ...prevComments]);
        }
      });

    return () => {
      socket.disconnect(); // Clean up connection
    };
  }, []); 

  const fetchComments = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.get_comments_for_game(id));
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    console.log(admin);
    fetchComments();
  }, [id]);

  // Keyboard event listeners for smooth input field animation
  useEffect(() => {

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      Animated.timing(keyboardHeight, {
        toValue: event.endCoordinates.height,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    // useEffect(() => {
    //     scrollViewRef.current?.scrollToEnd({ animated: true });
    //   }, [comments]);

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleCommentChange = (text) => {
    setNewComment(text);
  };


  const handlePlay = () => {
    navigate(`/runGame?id=${id}`); 
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
  
    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.write_comment, {
        gameId: id,
        text: newComment,
        gif: null,
      });
  
      const addedComment = {
        id: Date.now(), // Temporary ID
        text: newComment,
        date_and_time: new Date().toISOString().replace('T', ' ').slice(0, 19), 
      };
  
      setComments((prev) => [addedComment, ...prev]); // Optimistically update UI
      setNewComment('');

      scrollViewRef.current?.scrollToEnd({ animated: true });
  
      // Optional: wait for the socket event to replace with correct ID
  
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPlayer = async (id) => {
    try {
      const response = await axios.get(API_ENDPOINTS.top_player, {
        params: { game_id: id },
        withCredentials: true // in case the endpoint is protected by session
      });
  
      if (response.status === 200) {
        const { username, score } = response.data;
        console.log(`Top Player: ${username} with score: ${score}`);
        return { username, score };
      } else {
        console.warn("Unexpected response from top player API:", response);
        return null;
      }
    } catch (error) {
      console.error("Error fetching top player:", error);
      return null;
    }
  };
  
  useEffect(() => {
    const getTopPlayer = async () => {
      const topPlayerData = await fetchTopPlayer(id);
      if (topPlayerData) {
        setTopPlayer(topPlayerData);
      }
    };
  
    // Run immediately
    getTopPlayer();
  
    // Set interval to run every 5 seconds
    const interval = setInterval(() => {
      getTopPlayer();
    }, 5000);
  
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
          <View style={styles.gameProfile}>
           <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <CustomText style={styles.playBottun}>|&gt;</CustomText>
          </TouchableOpacity>
          <Image
          source={imageSource || handleImageError()} 
          style={styles.profileImage}
          onError={handleImageError} 
        />
        <CustomText style={styles.name}>
              {gameData?.name ? gameData.name : "Loading..."}
        </CustomText>
        <CustomText style={[styles.name, styles.description]}>
            {gameData?.description}
        </CustomText>
        {topPlayer?.username && (
  <View style={styles.topPlayerContainer}>
    {/* <CustomText style={styles.topPlayerTitle}>Top Player</CustomText> */}
    <CustomText style={styles.topPlayerText}>
      {topPlayer.username} - {topPlayer.score} pts
    </CustomText>
  </View>
)}
        </View>
    <ImageBackground style={styles.background}>
    {/* <Image source={require('./assets/logo.png')} resizeMode="contain" style={styles.logo} /> */}
<ScrollView style={styles.commentsContainer} ref={scrollViewRef} >
  {comments.length === 0 ? (
    <Text style={styles.text}>nothing yet</Text>
  ) : (
    comments.slice().reverse().map((comment) => (
      <View key={comment.id} style={styles.comment}>
      <Text style={styles.commentDate}>{comment.date_and_time}</Text>
        <Text style={styles.commentText}>&gt; {comment.text}</Text>
      </View>
    ))
  )}
</ScrollView>

      {isAdmin && (
          <View style={styles.container2}>
          <Animated.View
    style={[
      styles.commentInputContainer,
      { transform: [{ translateY: Animated.multiply(keyboardHeight, -1) }] },
    ]}
  >
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment"
                value={newComment}
                onChangeText={handleCommentChange}
              />
              <TouchableOpacity onPress={postComment} style={styles.sendButton}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <CustomText style={styles.sendButtonText}>Send</CustomText>
                )}
              </TouchableOpacity>
            </Animated.View>
            </View>
      )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  description:{
        color: '#262626',
        fontSize: 15,
  },
  playBottun: {
    color: '#28A745',
    fontWeight: 'bold',
    fontSize: 30,
    top: 30,
    marginRight: 300,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    backgroundColor: '#CE55F2',
  },
  gameProfile: {
   alignItems: 'center',
   flexDirection: 'column',

   top: -30,
  },
  topPlayerContainer: {
    alignItems: 'center',
  },
  name: {
    color: 'white',
    marginTop: 15,
    fontSize: 20,
  },
  topPlayerTitle: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },
  topPlayerText: {
    color: '#28A745',
    marginTop: 15,
    fontSize: 16,
  },
logo: {
        left:'30%',
        top: 250,
        position: 'absolute',
        width: 100,
        height: 100,
        opacity: 0.1, 
      },
background: {
        flex: 1,
        resizeMode: 'cover', // Make sure the image covers the screen
        width: '100%',
        right: 10,
        marginBottom: 50,
          },
  text: {
    color: 'white',
    textAlign: 'center',
    marginLeft: 5,
    fontSize: 16,
    fontFamily: 'Minecraft Regular'
  },
  container: {
    flex: 1,
    marginTop: 0, // Remove any default margin at the top
    marginBottom: 0,
  },
  container2: {
    justifyContent: 'space-between',
    padding: 10,
    width: 350,
  },
  commentsContainer: {
    flex: 1,
    // borderBottomWidth: 1,
    // borderBottomColor: '#5211BA',
    marginTop: 0,
    marginRight: 160,
    position: 'fixed',
  },
  comment: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  commentText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Minecraft Regular',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    left: 20,
  },
  commentInput: {
    flex: 1,
    padding: 10,
    backgroundColor: '#262626',
    fontFamily: 'Minecraft Regular',
    color: 'white',
    marginRight: 5,
    
  },
  commentDate: {
    color: '#262626',
    fontFamily: 'Minecraft Regular',
    marginBottom: 10,
  },
  sendButton: {
    paddingHorizontal: 10,
  },
  sendButtonText: {
    color: 'white',
  },
});   

export default GameServer;