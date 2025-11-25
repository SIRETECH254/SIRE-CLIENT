import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import { useGetProject, useUploadAttachment, useDeleteAttachment } from '@/tanstack/useProjects';

export default function AttachAssetsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id || '';

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetProject(projectId);

  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();

  const project = useMemo(() => {
    return data?.data?.project || data?.project || null;
  }, [data]);

  const attachments = useMemo(() => {
    return project?.attachments || [];
  }, [project]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load project';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadMessage(null);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setUploadMessage({ type: 'error', text: 'Failed to select file' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      
      // For React Native, we need to handle the file differently
      if (selectedFile.uri) {
        // @ts-ignore - FormData in React Native accepts objects with uri, type, name
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name || 'file',
        } as any);
      } else {
        setUploadMessage({ type: 'error', text: 'Invalid file selected' });
        setUploading(false);
        return;
      }

      await uploadMutation.mutateAsync({
        projectId,
        formData,
      });

      setUploadMessage({ type: 'success', text: 'File uploaded successfully!' });
      setSelectedFile(null);
      refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadMessage(null);
      }, 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to upload file';
      setUploadMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    try {
      await deleteMutation.mutateAsync({
        projectId,
        attachmentId,
      });
      refetch();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to delete attachment';
      setUploadMessage({ type: 'error', text: errorMsg });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setUploadMessage({ type: 'error', text: 'Cannot open this file' });
      }
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'Failed to open file' });
    }
  };

  if (isLoading && !project) {
    return <Loading fullScreen message="Loading project..." />;
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

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="font-poppins text-3xl font-bold text-gray-900 dark:text-gray-100">
              Attach Assets
            </Text>
            <Text className="font-inter text-base text-gray-600 dark:text-gray-400">
              Upload and manage files for this project
            </Text>
          </View>

          {error ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {uploadMessage ? (
            <Alert
              variant={uploadMessage.type}
              message={uploadMessage.text}
              className="w-full"
            />
          ) : null}

          {/* Upload Section */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Upload New File
            </Text>
            <View className="gap-4">
              <Pressable
                onPress={handleSelectFile}
                disabled={uploading}
                className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <View className="items-center gap-2">
                  <MaterialIcons name="cloud-upload" size={32} color="#6b7280" />
                  <Text className="font-inter text-base font-semibold text-gray-700 dark:text-gray-300">
                    {selectedFile ? selectedFile.name : 'Select File'}
                  </Text>
                  {selectedFile && selectedFile.size ? (
                    <Text className="font-inter text-sm text-gray-500 dark:text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  ) : null}
                </View>
              </Pressable>

              {selectedFile ? (
                <Pressable
                  onPress={handleUpload}
                  disabled={uploading}
                  className="rounded-xl bg-brand-primary px-6 py-3">
                  {uploading ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator color="#ffffff" />
                      <Text className="font-inter text-base font-semibold text-white">
                        Uploading...
                      </Text>
                    </View>
                  ) : (
                    <Text className="font-inter text-base font-semibold text-white text-center">
                      Upload File
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Existing Attachments */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Existing Attachments ({attachments.length})
            </Text>
            {attachments.length === 0 ? (
              <View className="items-center justify-center py-8">
                <MaterialIcons name="attach-file" size={48} color="#9ca3af" />
                <Text className="font-inter text-base text-gray-500 dark:text-gray-400 mt-3">
                  No attachments yet
                </Text>
                <Text className="font-inter text-sm text-gray-400 dark:text-gray-500 mt-1 text-center">
                  Upload your first file to get started
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {attachments.map((attachment: any) => {
                  const isDeleting = deletingId === (attachment._id || attachment.id);
                  return (
                    <View
                      key={attachment._id || attachment.id}
                      className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="attach-file" size={20} color="#6b7280" />
                          <Text
                            className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100 flex-1"
                            numberOfLines={1}>
                            {attachment.name || attachment.filename || 'Attachment'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-4 ml-7">
                          {attachment.size ? (
                            <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                              {formatFileSize(attachment.size)}
                            </Text>
                          ) : null}
                          {attachment.uploadedAt || attachment.createdAt ? (
                            <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(attachment.uploadedAt || attachment.createdAt)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {attachment.url ? (
                          <Pressable
                            onPress={() => handleDownload(attachment.url, attachment.name || attachment.filename)}
                            className="rounded-lg bg-brand-tint p-2">
                            <MaterialIcons name="download" size={20} color="#7b1c1c" />
                          </Pressable>
                        ) : null}
                        <Pressable
                          onPress={() => handleDelete(attachment._id || attachment.id)}
                          disabled={isDeleting}
                          className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                          {isDeleting ? (
                            <ActivityIndicator size="small" color="#dc2626" />
                          ) : (
                            <MaterialIcons name="delete" size={20} color="#dc2626" />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
            <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100 text-center">
              Back to Project
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

