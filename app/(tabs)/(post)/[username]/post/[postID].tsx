import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import Post, { Post as PostType } from "@/components/Post";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SideMenu from "@/components/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";

export default function PostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { username, postID } = useLocalSearchParams();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("postID", postID);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          fetch(`/posts/${postID}`).then((res) => res.json()),
          fetch(`/posts/${postID}/comments`).then((res) => res.json()),
        ]);

        setPost(postData.post);
        setComments(commentsData.posts);
        setIsLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, [postID]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      {isLoading ? (
        <Text>로딩중...</Text>
      ) : (
        <React.Fragment>
          <View
            style={[
              styles.header,
              colorScheme === "dark" ? styles.headerDark : styles.headerLight,
            ]}
          >
            {router.canGoBack() ? (
              <Pressable
                style={styles.menuButton}
                onPress={() => {
                  router.back();
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colorScheme === "dark" ? "gray" : "black"}
                />
              </Pressable>
            ) : (
              <Pressable
                style={styles.menuButton}
                onPress={() => {
                  setIsSideMenuOpen(true);
                }}
              >
                <Ionicons
                  name="menu"
                  size={24}
                  color={colorScheme === "dark" ? "gray" : "black"}
                />
              </Pressable>
            )}
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.logo}
            />
            <SideMenu
              isVisible={isSideMenuOpen}
              onClose={() => setIsSideMenuOpen(false)}
            />
          </View>
          {post && (
            <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
              <Post item={post} />
              <View style={styles.repliesHeader}>
                <Text
                  style={
                    colorScheme === "dark"
                      ? styles.repliesHeaderDark
                      : styles.repliesHeaderLight
                  }
                >
                  Replies
                </Text>
              </View>
              <FlashList
                data={comments}
                renderItem={({ item }) => <Post item={item} />}
                estimatedItemSize={200}
              />
            </ScrollView>
          )}
        </React.Fragment>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLight: {
    backgroundColor: "white",
  },
  headerDark: {
    backgroundColor: "#101010",
  },
  menuButton: {
    position: "absolute",
    left: 16,
  },
  logo: {
    width: 32,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  repliesHeader: {
    height: 50,
    paddingLeft: 16,
    borderBottomWidth: 1,
    justifyContent: "center",
    borderBottomColor: "#e0e0e0",
  },
  repliesHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  repliesHeaderDark: {
    color: "white",
  },
  repliesHeaderLight: {
    color: "#000",
  },
});
