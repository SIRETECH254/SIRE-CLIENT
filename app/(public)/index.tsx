import { View, Text, TouchableOpacity, ScrollView, ImageBackground, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LandingPage() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive hero height based on screen size
  // Mobile: ~50% of screen height, Tablet: ~60%, Desktop: ~70%
  const getHeroHeight = () => {
    if (width < 640) {
      // Mobile
      return height * 0.5;
    } else if (width < 1024) {
      // Tablet
      return height * 0.6;
    } else {
      // Desktop
      return height * 0.7;
    }
  };

  const heroHeight = getHeroHeight();

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section with Background Image */}
      <ImageBackground
        source={require('@/assets/images/Boao Forum For Asia Technology Blue Advertising Background Backgrounds _ PSD Free Download - Pikbest.jpeg')}
        resizeMode="cover"
        style={{
          width: '100%',
          height: heroHeight,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className="relative"
      >
        {/* Dark overlay for better text readability */}
        <View 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.4)' 
          }}
        />
        
        {/* Hero Content */}
        <View className="px-6 py-8 items-center justify-center" style={{ zIndex: 1 }}>
          {/* Big Heading */}
          <ThemedText 
            type="title" 
            className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4 text-center"
            style={{ 
              color: '#ffffff',
              textShadowColor: 'rgba(0, 0, 0, 0.75)', 
              textShadowOffset: { width: 0, height: 2 }, 
              textShadowRadius: 4 
            }}
          >
            Welcome to SIRE TECH
          </ThemedText>
          
          {/* Small Subheading */}
          <ThemedText 
            className="text-lg md:text-xl lg:text-2xl font-inter text-white mb-8 text-center max-w-2xl"
            style={{ 
              color: '#ffffff',
              textShadowColor: 'rgba(0, 0, 0, 0.5)', 
              textShadowOffset: { width: 0, height: 1 }, 
              textShadowRadius: 3 
            }}
          >
            Innovative technology solutions for your business needs.
          </ThemedText>
          
          {/* CTA Button */}
          <TouchableOpacity
            onPress={() => router.push('/(public)/login')}
            className="bg-brand-primary px-8 py-4 rounded-xl shadow-lg"
          >
            <Text className="text-white font-inter font-semibold text-base md:text-lg">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Rest of the content */}
      <ThemedView className="px-6 py-12">

        {/* Services Preview */}
        <View className="mb-12">
          <ThemedText type="subtitle" className="text-2xl font-poppins font-semibold text-black mb-4">
            Our Services
          </ThemedText>
          <ThemedText className="text-base font-inter text-gray-700 mb-4">
            We offer a wide range of technology solutions tailored to your business needs.
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(public)/services')}
            className="bg-brand-soft px-4 py-2 rounded-lg self-start">
            <Text className="text-white font-inter font-semibold text-sm">
              View All Services
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => router.push('/(public)/about')}
            className="flex-1 bg-gray-50 px-4 py-3 rounded-xl">
            <Text className="text-center font-inter font-semibold text-base text-gray-700">
              About Us
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(public)/contact')}
            className="flex-1 bg-gray-50 px-4 py-3 rounded-xl">
            <Text className="text-center font-inter font-semibold text-base text-gray-700">
              Contact
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

