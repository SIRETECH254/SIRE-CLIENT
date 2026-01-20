import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import { useGetClientProjects } from '@/tanstack/useProjects';

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profileData } = useGetProfile();

  // Get clientId from profile or user
  const clientId = useMemo(() => {
    const profile = profileData?.data?.user;
    return profile?._id || profile?.id || user?._id || user?.id || null;
  }, [profileData, user]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetClientProjects(clientId || '');

  const projects = useMemo(() => {
    return data?.data?.projects || data?.projects || [];
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load projects';

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'play-circle-filled';
      case 'on_hold':
        return 'pause-circle-filled';
      case 'cancelled':
        return 'cancel';
      default:
        return 'schedule';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'priority-high';
      case 'high':
        return 'arrow-upward';
      case 'medium':
        return 'remove';
      case 'low':
        return 'arrow-downward';
      default:
        return 'remove';
    }
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/(authenticated)/projects/${projectId}`);
  };

  // Project Skeleton Component
  const ProjectSkeleton = () => (
    <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <View className="gap-4">
        {/* Header */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="h-6 bg-gray-200 rounded mb-2 w-3/4 dark:bg-gray-700" />
            <View className="h-4 bg-gray-200 rounded w-2/3 dark:bg-gray-700" />
          </View>
          <View className="w-6 h-6 bg-gray-200 rounded dark:bg-gray-700" />
        </View>

        {/* Badges */}
        <View className="flex-row items-center gap-2">
          <View className="h-6 bg-gray-200 rounded-full w-20 dark:bg-gray-700" />
          <View className="h-6 bg-gray-200 rounded-full w-16 dark:bg-gray-700" />
        </View>

        {/* Progress */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <View className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700" />
            <View className="h-4 bg-gray-200 rounded w-12 dark:bg-gray-700" />
          </View>
          <View className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700" />
        </View>

        {/* Dates */}
        <View className="flex-row items-center gap-4">
          <View className="h-3 bg-gray-200 rounded w-24 dark:bg-gray-700" />
          <View className="h-3 bg-gray-200 rounded w-24 dark:bg-gray-700" />
        </View>
        <View className="h-3 bg-gray-200 rounded w-32 dark:bg-gray-700" />
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        <View className="px-6 py-8 gap-6">
          <View className="mb-4">
            <Text className="font-poppins text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Projects
            </Text>
            <Text className="font-inter text-base text-gray-600 dark:text-gray-400 mt-2">
              View and manage your projects
            </Text>
          </View>

          {error && !isLoading ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {isLoading && !projects.length && (
            <View className="gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProjectSkeleton key={`skeleton-${index}`} />
              ))}
            </View>
          )}

          {!isLoading && projects.length === 0 && (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="folder-open" size={64} color="#9ca3af" />
              <Text className="font-inter text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                No projects found
              </Text>
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                You don't have any projects assigned yet.
              </Text>
            </View>
          )}

          {!isLoading && projects.length > 0 && (
            <View className="gap-4">
              {projects.map((project: any) => (
                <Pressable
                  key={project._id || project.id}
                  onPress={() => handleProjectPress(project._id || project.id)}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <View className="gap-4">
                    {/* Header */}
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {project.projectNumber || `Project #${project._id?.slice(-6) || 'N/A'}`}
                        </Text>
                        <Text className="font-inter text-base text-gray-700 dark:text-gray-300 mt-1">
                          {project.title || 'Untitled Project'}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                    </View>

                    {/* Badges */}
                    <View className="flex-row items-center gap-2 flex-wrap">
                      {project.status ? (
                        <Badge
                          variant={getStatusVariant(project.status)}
                          size="sm"
                          icon={
                            <MaterialIcons
                              name={getStatusIcon(project.status) as any}
                              size={14}
                              color={
                                project.status === 'completed'
                                  ? '#059669'
                                  : project.status === 'in_progress'
                                  ? '#2563eb'
                                  : project.status === 'on_hold'
                                  ? '#f59e0b'
                                  : project.status === 'cancelled'
                                  ? '#dc2626'
                                  : '#6b7280'
                              }
                            />
                          }>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      ) : null}
                      {project.priority ? (
                        <Badge
                          variant={getPriorityVariant(project.priority)}
                          size="sm"
                          icon={
                            <MaterialIcons
                              name={getPriorityIcon(project.priority) as any}
                              size={14}
                              color={
                                project.priority === 'urgent'
                                  ? '#dc2626'
                                  : project.priority === 'high'
                                  ? '#f59e0b'
                                  : project.priority === 'medium'
                                  ? '#2563eb'
                                  : '#6b7280'
                              }
                            />
                          }>
                          {project.priority.toUpperCase()}
                        </Badge>
                      ) : null}
                    </View>

                    {/* Progress */}
                    {project.progress !== undefined ? (
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            Progress
                          </Text>
                          <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {project.progress}%
                          </Text>
                        </View>
                        <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                          <View
                            className="h-full bg-brand-primary rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
                          />
                        </View>
                      </View>
                    ) : null}

                    {/* Dates */}
                    <View className="flex-row items-center gap-4 flex-wrap">
                      {project.startDate ? (
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="event" size={16} color="#6b7280" />
                          <Text className="font-inter text-xs text-gray-600 dark:text-gray-400">
                            Start: {formatDate(project.startDate)}
                          </Text>
                        </View>
                      ) : null}
                      {project.endDate ? (
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="event" size={16} color="#6b7280" />
                          <Text className="font-inter text-xs text-gray-600 dark:text-gray-400">
                            End: {formatDate(project.endDate)}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Created date */}
                    {project.createdAt ? (
                      <View className="flex-row items-center gap-2">
                        <MaterialIcons name="schedule" size={16} color="#6b7280" />
                        <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                          Created {formatDate(project.createdAt)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
