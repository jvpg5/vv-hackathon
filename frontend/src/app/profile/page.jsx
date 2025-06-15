'use client';

import { useState, useEffect } from 'react';
import { authService, usersService, uploadService, getStrapiImageUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Trophy, MapPin, Calendar, Edit3, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ranking, setRanking] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar: null
  });

  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadUserData();
    loadRanking();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getMe();
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        bio: userData.bio || '',
        avatar: userData.avatar
      });
    } catch (error) {
      setError('Erro ao carregar dados do perfil');
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRanking = async () => {
    try {
      const rankingData = await usersService.getRanking(100);
      if (rankingData.length > 0) {
        const userPosition = rankingData.findIndex(u => u.id === authService.getCurrentUser()?.id);
        setRanking({
          position: userPosition + 1,
          total: rankingData.length
        });
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadResponse = await uploadService.uploadImage(file);
      if (uploadResponse && uploadResponse[0]) {
        setFormData(prev => ({
          ...prev,
          avatar: uploadResponse[0]
        }));
      }
    } catch (error) {
      setError('Erro ao fazer upload da imagem');
      console.error('Error uploading image:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const updateData = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio
      };

      if (formData.avatar && formData.avatar.id) {
        updateData.avatar = formData.avatar.id;
      }

      await usersService.updateProfile(user.id, updateData);
      
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
      await loadUserData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Erro ao atualizar perfil');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      avatar: user.avatar
    });
    setIsEditing(false);
    setError('');
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const getUserAvatarUrl = () => {
    if (formData.avatar) {
      return getStrapiImageUrl(formData.avatar.url || formData.avatar.formats?.thumbnail?.url);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            
            <h1 className="text-xl font-bold">Meu Perfil</h1>
            
            <div className="w-9 h-9"></div> {/* Spacer */}
          </div>
        </div>
        
        {/* Profile Header Card */}
        <div className="px-4 pb-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-3 border-green-100 bg-gray-200 overflow-hidden shadow-lg">
                  {getUserAvatarUrl() ? (
                    <img 
                      src={getUserAvatarUrl()} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-100">
                      <span className="text-xl text-green-600 font-bold">
                        {(formData.first_name?.[0] || formData.username?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )} */}
              </div>
              
              {/* User Info */}
              <div className="flex-1 w-fit overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.first_name && formData.last_name 
                    ? `${formData.first_name} ${formData.last_name}`
                    : formData.username
                  }
                </h2>
                <p className="text-green-600 font-medium">@{formData.username}</p>
                {formData.bio && (
                  <p className="text-gray-600 text-sm mt-2">{formData.bio}</p>
                )}
              </div>
              
              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
                  >
                    <Edit3 size={16} />
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Points Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Pontos</h3>
                <p className="text-2xl font-bold">{user?.pontos || 0}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <Trophy className="text-white" size={20} />
              </div>
            </div>
          </div>

          {/* Ranking Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Ranking</h3>
                <p className="text-2xl font-bold">#{ranking?.position || '-'}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <MapPin className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome de usuário
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="text-green-600 mr-2" size={20} />
            Informações da Conta
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Membro desde:</span>
              <span className="font-medium text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última atualização:</span>
              <span className="font-medium text-gray-900">
                {new Date(user?.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {ranking && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total de usuários:</span>
                <span className="font-medium text-gray-900">{ranking.total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols gap-4">
          <button
            onClick={() => router.push('/scanner')}
            className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <Camera size={20} />
            <span>Escanear QR</span>
          </button>
          
          <button
            onClick={() => router.push('/rewards')}
            className="bg-yellow-500 text-white px-4 py-3 rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <Trophy size={20} />
            <span>Recompensas</span>
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
