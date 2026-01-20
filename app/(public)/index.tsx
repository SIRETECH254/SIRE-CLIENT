import { View, Text, TouchableOpacity, ScrollView, ImageBackground, useWindowDimensions, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGetActiveServices } from '@/tanstack/useServices';
import { useMemo } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function LandingPage() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  // Fetch active services
  const servicesQuery = useGetActiveServices();
  
  // Separate hook variables
  const servicesData = servicesQuery.data;
  const isLoadingServices = servicesQuery.isLoading;
  const servicesError = servicesQuery.error;
  
  // Extract services from response
  const services = useMemo(() => {
    return servicesData?.data?.services || servicesData?.services || servicesData?.data || [];
  }, [servicesData]);
  
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
  
  // Calculate grid columns based on screen width
  const getGridColumns = () => {
    if (width < 640) {
      return 1; // Mobile: 1 column
    } else if (width < 1024) {
      return 2; // Tablet: 2 columns
    } else {
      return 3; // Desktop: 3 columns
    }
  };

  const gridColumns = getGridColumns();
  
  // Service Skeleton Component
  const ServiceSkeleton = () => (
    <View className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="items-center mb-3">
        <View className="w-16 h-16 rounded-full bg-gray-200" />
      </View>
      <View className="h-4 bg-gray-200 rounded mb-2" />
      <View className="h-3 bg-gray-200 rounded mb-1 w-3/4" />
      <View className="h-3 bg-gray-200 rounded w-2/3" />
    </View>
  );
  
  // Service Card Component
  const ServiceCard = ({ service }: { service: any }) => {
    const serviceIcon = service.icon || 'business-center';
    const serviceTitle = service.title || service.name || 'Service';
    const serviceDescription = service.description || '';
    
    return (
      <TouchableOpacity
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm active:opacity-80"
        onPress={() => console.log('Service clicked:', service)}
      >
        <View className="items-center mb-3">
          <View className="w-16 h-16 rounded-full bg-brand-primary/10 items-center justify-center">
            <MaterialIcons name={serviceIcon as any} size={32} color="#7b1c1c" />
          </View>
        </View>
        <Text className="font-poppins text-base font-semibold text-gray-900 mb-2 text-center" numberOfLines={2}>
          {serviceTitle}
        </Text>
        {serviceDescription ? (
          <Text className="font-inter text-sm text-gray-600 text-center" numberOfLines={3}>
            {serviceDescription}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };
  
  // Render item for FlatList
  const renderServiceItem = ({ item }: { item: any }) => {
    const itemWidth = gridColumns === 1 ? '100%' : gridColumns === 2 ? '48%' : '31%';
    return (
      <View style={{ width: itemWidth }}>
        <ServiceCard service={item} />
      </View>
    );
  };
  
  // Key extractor for FlatList
  const keyExtractor = (item: any, index: number) => {
    return item._id || item.id || `service-${index}`;
  };

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
          
        </View>
      </ImageBackground>

      {/* Rest of the content */}
      <ThemedView className="px-6 py-12">

        {/* Services Section */}
        <View className="mb-12">
          <ThemedText type="subtitle" className="text-2xl font-poppins font-semibold text-black mb-4 text-center">
            Our Services
          </ThemedText>
          <ThemedText className="text-base font-inter text-gray-700 mb-6 text-center">
            We offer a wide range of technology solutions tailored to your business needs.
          </ThemedText>
          
          {/* Services Grid */}
          {isLoadingServices && (
            <FlatList
              key={`skeleton-${gridColumns}`}
              data={Array.from({ length: 6 })}
              numColumns={gridColumns}
              keyExtractor={(_, index) => `skeleton-${index}`}
              renderItem={() => {
                const itemWidth = gridColumns === 1 ? '100%' : gridColumns === 2 ? '48%' : '31%';
                return (
                  <View style={{ width: itemWidth }}>
                    <ServiceSkeleton />
                  </View>
                );
              }}
              scrollEnabled={false}
              columnWrapperStyle={gridColumns > 1 ? { justifyContent: 'space-between' } : undefined}
              contentContainerStyle={{ gap: 16 }}
            />
          )}
          
          {servicesError && (
            <View className="items-center justify-center py-8">
              <MaterialIcons name="error-outline" size={48} color="#9ca3af" />
              <Text className="font-inter text-base text-gray-600 mt-4 text-center">
                Unable to load services at this time.
              </Text>
            </View>
          )}
          
          {services.length === 0 && !isLoadingServices && !servicesError && (
            <View className="items-center justify-center py-8">
              <MaterialIcons name="business-center" size={48} color="#9ca3af" />
              <Text className="font-inter text-base text-gray-600 mt-4 text-center">
                No services available at this time.
              </Text>
            </View>
          )}
          
          {services.length > 0 && (
            <FlatList
              key={`services-${gridColumns}`}
              data={services}
              numColumns={gridColumns}
              keyExtractor={keyExtractor}
              renderItem={renderServiceItem}
              scrollEnabled={false}
              columnWrapperStyle={gridColumns > 1 ? { justifyContent: 'space-between' } : undefined}
              contentContainerStyle={{ gap: 16 }}
            />
          )}
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

