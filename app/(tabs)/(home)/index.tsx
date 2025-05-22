import { View, StyleSheet, useColorScheme } from "react-native";
import { usePathname } from "expo-router";
import Post, { type Post as PostType } from "@/components/Post";
import { useCallback, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";

export default function Index() {
  const colorScheme = useColorScheme();
  const path = usePathname();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  console.log("posts", posts.length);

  const onEndReached = useCallback(() => {
    console.log("onEndReached", posts.at(-1)?.id);
    fetch(`posts?cursor=${posts.at(-1)?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.posts.length > 0) {
          setPosts((prev) => [...prev, ...data.posts]);
        }
      });
  }, [posts, path]);

  const onRefresh = () => {
    setRefreshing(true);
    setPosts([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetch("/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts))
      .finally(() => setRefreshing(false));
  };

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
      ]}
    >
      <FlashList
        data={posts}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => <Post item={item} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={2}
        estimatedItemSize={350}
      />
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
  textLight: {
    color: "black",
  },
  textDark: {
    color: "white",
  },
});
