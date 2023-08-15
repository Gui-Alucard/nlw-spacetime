import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'

import { Link, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'

import { api } from '../src/lib/api'

import Icon from '@expo/vector-icons/Feather'
import NLWLogo from '../src/assets/nlw-spacetime-logo.svg'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

export default function NewMemories() {
  const router = useRouter()
  const { bottom, top } = useSafeAreaInsets()

  const [preview, setPreview] = useState<null | string>()
  const [content, setContent] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>()

  const [date, setDate] = useState<Date>(new Date())

  const onChange = (_event: DateTimePickerEvent, selectedDate: Date) => {
    const currentDate = selectedDate
    setDate(currentDate)
  }

  async function openImagePicker() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })

      if (result.assets[0]) {
        setPreview(result.assets[0].uri)
      }
    } catch (error) {
      console.log('Erro___', error)
    }
  }

  async function handleCreateMemory() {
    const token = await SecureStore.getItemAsync('token')

    let coverUrl = ''
    if (preview) {
      const uploadFormData = new FormData()

      uploadFormData.append('file', {
        uri: preview,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any)

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      coverUrl = uploadResponse.data.fileUrl
    }

    const memoryDate = dayjs(date).format('D[ de ]MMMM[, ]YYYY')
    await api.post(
      '/memories',
      {
        content,
        isPublic,
        coverUrl,
        memoryDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // replace refresh / push dont
    router.replace('/memories')
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NLWLogo />

        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>

      <View className="mt-6 space-y-6">
        <View className="flex-row items-center gap-2">
          <Switch
            thumbColor={isPublic ? '#ab8eee' : '#eaeaea'}
            trackColor={{ false: '#bebebf', true: '#48307e' }}
            value={isPublic}
            onValueChange={setIsPublic}
          />
          <Text className="font-alt text-lg text-gray-200">
            Tornar memória pública
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openImagePicker}
          className="h-32 items-center justify-center rounded-lg border border-dashed border-gray-500 bg-black/20"
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              alt="preview of the uploaded image"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name="image" color="#fff" />
              <Text className="font-body text-sm text-gray-200">
                Adicionar foto ou vídeo de capa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-col items-start gap-3">
          <View className="flex-row items-center justify-around">
            <Text className="font-alt text-lg text-gray-200">
              Selecionar Data
            </Text>
            <View className="ml-4 rounded border-2 border-purple-300">
              <DateTimePicker
                value={date}
                mode="date"
                is24Hour={true}
                onChange={onChange}
                style={{
                  backgroundColor: '#ab8eee',
                }}
              />
            </View>
          </View>
        </View>

        <TextInput
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          className="mb-6 p-0 font-body text-lg text-gray-50"
          placeholderTextColor="#56565a"
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCreateMemory}
          className="items-center rounded-full bg-green-500 px-5 py-2"
        >
          <Text className="font-alt text-sm uppercase text-black">Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
