import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Phase =
  | "home"
  | "guard-start"
  | "mission-1"
  | "mission-2"
  | "mission-3"
  | "guard-success"
  | "next-stage";

const TAP_TARGET = 20;

export default function HomeScreen() {
  const [phase, setPhase] = useState<Phase>("home");
  const [tapCount, setTapCount] = useState(0);

  const reset = () => {
    setPhase("home");
    setTapCount(0);
  };

  // === HOME ===
  if (phase === "home") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Alcoholic Guard</Text>
          <Text style={styles.subtitle}>飲酒衝動防衛システム</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => setPhase("guard-start")}
            activeOpacity={0.8}
          >
            <Text style={styles.dangerButtonText}>危険</Text>
            <Text style={styles.dangerSubText}>飲みたい衝動がある</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === GUARD MODE START ===
  if (phase === "guard-start") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.guardLabel}>⚡ GUARD MODE</Text>
          <Text style={styles.guardMessage}>
            衝動のピークは数分で過ぎる。{"\n"}
            このアプリを操作し続けてください。
          </Text>
          <Text style={styles.missionCount}>MISSION 1 / 3</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setPhase("mission-1")}
          >
            <Text style={styles.primaryButtonText}>開始する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === MISSION 1: 水を用意する ===
  if (phase === "mission-1") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.missionLabel}>MISSION 1</Text>
          <Text style={styles.missionTitle}>水を用意してください</Text>
          <Text style={styles.missionDesc}>
            コップ1杯の水を手元に置いてください。{"\n"}
            準備ができたら下のボタンを押してください。
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setTapCount(0);
              setPhase("mission-2");
            }}
          >
            <Text style={styles.primaryButtonText}>用意した</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === MISSION 2: タップミッション ===
  if (phase === "mission-2") {
    const progress = Math.min(tapCount / TAP_TARGET, 1);
    const cleared = tapCount >= TAP_TARGET;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.missionLabel}>MISSION 2</Text>
          <Text style={styles.missionTitle}>
            {cleared ? "MISSION CLEAR" : "タップし続けてください"}
          </Text>

          {!cleared ? (
            <>
              <Text style={styles.tapCounter}>
                {tapCount} / {TAP_TARGET}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <TouchableOpacity
                style={styles.tapButton}
                onPress={() => setTapCount((c) => c + 1)}
                activeOpacity={0.6}
              >
                <Text style={styles.tapButtonText}>TAP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.clearText}>✓ クリア</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setPhase("mission-3")}
              >
                <Text style={styles.primaryButtonText}>次へ</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // === MISSION 3: 再判定 ===
  if (phase === "mission-3") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.missionLabel}>MISSION 3</Text>
          <Text style={styles.missionTitle}>まだ飲みたいですか？</Text>

          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={styles.choiceButtonDanger}
              onPress={() => setPhase("next-stage")}
            >
              <Text style={styles.choiceText}>まだ飲みたい</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceButtonSafe}
              onPress={() => setPhase("guard-success")}
            >
              <Text style={styles.choiceText}>少し落ち着いた</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // === GUARD SUCCESS ===
  if (phase === "guard-success") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successIcon}>🛡️</Text>
          <Text style={styles.successTitle}>GUARD SUCCESS</Text>
          <Text style={styles.successMessage}>
            衝動のピークをやり過ごしました。{"\n"}
            あなたの勝ちです。
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={reset}>
            <Text style={styles.homeButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === NEXT STAGE (placeholder) ===
  if (phase === "next-stage") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.guardLabel}>⚡ GUARD MODE</Text>
          <Text style={styles.missionTitle}>次の防衛ステージへ</Text>
          <Text style={styles.missionDesc}>
            まだ衝動が残っています。{"\n"}
            次のステージを準備中です。
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={reset}>
            <Text style={styles.homeButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8888aa",
    marginBottom: 64,
  },
  dangerButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 28,
    paddingHorizontal: 48,
    borderRadius: 16,
    minWidth: "70%",
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  dangerSubText: {
    fontSize: 12,
    color: "#ffcccc",
    marginTop: 4,
  },
  guardLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
    letterSpacing: 2,
    marginBottom: 24,
  },
  guardMessage: {
    fontSize: 16,
    color: "#ccccdd",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
  },
  missionCount: {
    fontSize: 14,
    color: "#8888aa",
    marginBottom: 24,
  },
  missionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fbbf24",
    letterSpacing: 1,
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  missionDesc: {
    fontSize: 15,
    color: "#aaaacc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#e94560",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 180,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tapCounter: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  progressBar: {
    width: "80%",
    height: 8,
    backgroundColor: "#2a2a4a",
    borderRadius: 4,
    marginBottom: 32,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 4,
  },
  tapButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e94560",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#e94560",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  tapButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  clearText: {
    fontSize: 24,
    color: "#4ade80",
    fontWeight: "bold",
    marginBottom: 32,
  },
  choiceRow: {
    gap: 16,
    width: "100%",
    marginTop: 24,
  },
  choiceButtonDanger: {
    backgroundColor: "#2a2a4a",
    borderWidth: 2,
    borderColor: "#ef4444",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  choiceButtonSafe: {
    backgroundColor: "#2a2a4a",
    borderWidth: 2,
    borderColor: "#4ade80",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  choiceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4ade80",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "#ccccdd",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  homeButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#2a2a4a",
  },
  homeButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
