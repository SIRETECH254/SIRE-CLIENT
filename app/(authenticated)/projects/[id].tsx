import React, { useMemo } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { getInitials, formatDate } from '@/utils';
import { useGetProject } from '@/tanstack/useProjects';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id || '';

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetProject(projectId);

  const project = useMemo(() => {
    return data?.data?.project || data?.project || null;
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load project details';

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

  const handleAttachAssets = () => {
    router.push(`/(authenticated)/projects/${projectId}/attach-assets`);
  };

  if (isLoading && !project) {
    return <Loading fullScreen message="Loading project details..." />;
  }

  if (!project) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            <Alert variant="error" message={errorMessage || 'Project not found'} className="w-full" />
            <Pressable
              onPress={() => router.back()}
              className="mt-4 rounded-xl bg-brand-primary px-6 py-3">
              <Text className="font-inter text-base font-semibold text-white text-center">
                Go Back
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const milestones = project.milestones || [];
  const attachments = project.attachments || [];
  const services = project.services || [];
  const teamMembers = project.teamMembers || project.team || [];

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        <View className="px-6 py-8 gap-6">
          {/* Header */}
          <View className="gap-3">
            <Text className="font-poppins text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project.projectNumber || `Project #${project._id?.slice(-6) || 'N/A'}`}
            </Text>
            <Text className="font-inter text-lg text-gray-700 dark:text-gray-300">
              {project.title || 'Untitled Project'}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              {project.status ? (
                <Badge
                  variant={getStatusVariant(project.status)}
                  size="md"
                  icon={
                    <MaterialIcons
                      name={getStatusIcon(project.status) as any}
                      size={16}
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
                  size="md"
                  icon={
                    <MaterialIcons
                      name={getPriorityIcon(project.priority) as any}
                      size={16}
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
          </View>

          {error ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {/* Description */}
          {project.description ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="description" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Description
                </Text>
              </View>
              <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                {project.description}
              </Text>
            </View>
          ) : null}

          {/* Client Information */}
          {project.client ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="person" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Client Information
                </Text>
              </View>
              <View className="gap-3">
                {project.client.name ? (
                  <InfoRow icon="person" label="Name" value={project.client.name} />
                ) : null}
                {project.client.email ? (
                  <InfoRow icon="mail-outline" label="Email" value={project.client.email} />
                ) : null}
                {project.client.phone ? (
                  <InfoRow icon="call" label="Phone" value={project.client.phone} />
                ) : null}
                {project.client.company ? (
                  <InfoRow icon="business" label="Company" value={project.client.company} />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Services */}
          {services.length > 0 ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="business-center" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Services
                </Text>
              </View>
              <View className="flex-row items-center gap-2 flex-wrap">
                {services.map((service: any, index: number) => (
                  <Badge
                    key={service._id || service.id || index}
                    variant="info"
                    size="sm"
                    icon={
                      <MaterialIcons name="check-circle" size={14} color="#000000" />
                    }>
                    {service.name || service.title || 'Service'}
                  </Badge>
                ))}
              </View>
            </View>
          ) : null}

          {/* Team Members */}
          {teamMembers.length > 0 ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="group" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Team Members
                </Text>
              </View>
              <View className="gap-3">
                {teamMembers.map((member: any, index: number) => {
                  const memberName = member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Team Member';
                  const initials = getInitials({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                  });
                  return (
                    <View key={member._id || member.id || index} className="flex-row items-center gap-3">
                      {member.avatar ? (
                        <Image
                          source={{ uri: member.avatar }}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-tint">
                          <Text className="font-poppins text-sm font-semibold text-brand-primary">
                            {initials}
                          </Text>
                        </View>
                      )}
                      <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
                        {memberName}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Timeline */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="schedule" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Timeline
              </Text>
            </View>
            <View className="gap-3">
              {project.startDate ? (
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="event" size={20} color="#6b7280" />
                  <View className="flex-1">
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                      Start Date
                    </Text>
                    <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
                      {formatDate(project.startDate)}
                    </Text>
                  </View>
                </View>
              ) : null}
              {project.endDate ? (
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="event" size={20} color="#6b7280" />
                  <View className="flex-1">
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                      End Date
                    </Text>
                    <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
                      {formatDate(project.endDate)}
                    </Text>
                  </View>
                </View>
              ) : null}
              {project.completedAt ? (
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="check-circle" size={20} color="#10b981" />
                  <View className="flex-1">
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                      Completed
                    </Text>
                    <Text className="font-inter text-base text-gray-900 dark:text-gray-100">
                      {formatDate(project.completedAt)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {/* Progress */}
          {project.progress !== undefined ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="trending-up" size={20} color="#7b1c1c" />
                  <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Progress
                  </Text>
                </View>
                <Text className="font-inter text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {project.progress}%
                </Text>
              </View>
              <View className="h-3 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <View
                  className="h-full bg-brand-primary rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
                />
              </View>
            </View>
          ) : null}

          {/* Milestones Preview */}
          {milestones.length > 0 ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="flag" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Milestones ({milestones.length})
                </Text>
              </View>
              <View className="gap-3">
                {milestones.slice(0, 5).map((milestone: any, index: number) => {
                  const isCompleted = milestone.status === 'completed' || milestone.completed;
                  return (
                    <View key={milestone._id || milestone.id || index} className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100">
                          {milestone.title || 'Milestone'}
                        </Text>
                        <Badge
                          variant={isCompleted ? 'success' : 'default'}
                          size="sm"
                          icon={
                            <MaterialIcons
                              name={isCompleted ? 'check-circle' : 'schedule'}
                              size={14}
                              color={isCompleted ? '#059669' : '#6b7280'}
                            />
                          }>
                          {isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </View>
                    {milestone.description ? (
                      <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </Text>
                    ) : null}
                    {milestone.dueDate ? (
                      <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                        Due: {formatDate(milestone.dueDate)}
                      </Text>
                    ) : null}
                    </View>
                  );
                })}
                {milestones.length > 5 ? (
                  <Text className="font-inter text-sm text-gray-500 dark:text-gray-500 mt-2">
                    +{milestones.length - 5} more milestone{milestones.length - 5 !== 1 ? 's' : ''}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Attachments Preview */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="attach-file" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Attachments
                </Text>
              </View>
              <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {attachments.length > 0 ? (
              <View className="gap-2 mb-3">
                {attachments.slice(0, 3).map((attachment: any, index: number) => (
                  <View key={attachment._id || attachment.id || index} className="flex-row items-center gap-2">
                    <MaterialIcons name="attach-file" size={20} color="#6b7280" />
                    <Text className="font-inter text-sm text-gray-700 dark:text-gray-300 flex-1" numberOfLines={1}>
                      {attachment.name || attachment.filename || 'Attachment'}
                    </Text>
                  </View>
                ))}
                {attachments.length > 3 ? (
                  <Text className="font-inter text-sm text-gray-500 dark:text-gray-500">
                    +{attachments.length - 3} more file{attachments.length - 3 !== 1 ? 's' : ''}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-500">
                No attachments yet
              </Text>
            )}
            <Pressable
              onPress={handleAttachAssets}
              className="rounded-xl bg-brand-primary px-6 py-3 mt-2">
              <Text className="font-inter text-base font-semibold text-white text-center">
                Attach Assets
              </Text>
            </Pressable>
          </View>

          {/* Notes */}
          {project.notes ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="note" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Notes
                </Text>
              </View>
              <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                {project.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-100">
        {value ?? '—'}
      </Text>
    </View>
  );
}
