"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { localsService, getStrapiImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { 
  MapPin, 
  Star, 
  Search,
  Filter,
  Grid,
  List,
  ArrowLeft,
  Trophy,
  Eye,
  X
} from "lucide-react";

const CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'historia', label: 'História' },
  { value: 'evento', label: 'Evento' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'outro', label: 'Outro' }
];

export default function AllLocalsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: appLoading } = useApp();
  
  const [locals, setLocals] = useState([]);
  const [filteredLocals, setFilteredLocals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'points', 'newest'

  // Redirect if not authenticated
  useEffect(() => {
    if (!appLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, appLoading]);

  // Load all locals
  useEffect(() => {
    const loadLocals = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const response = await localsService.getAll({
          'populate': '*',
          'pagination[pageSize]': 100,
          'sort': 'createdAt:desc'
        });
        
        setLocals(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
        setError('Erro ao carregar locais');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocals();
  }, [isAuthenticated]);

  // Filter and search locals
  useEffect(() => {
    let filtered = [...locals];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(local => local.categoria === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(local =>
        local.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        local.descricao_curta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        local.descricao_longa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return (b.pontuacao || 0) - (a.pontuacao || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
        default:
          return (a.nome || '').localeCompare(b.nome || '');
      }
    });

    setFilteredLocals(filtered);
  }, [locals, searchTerm, selectedCategory, sortBy]);

  const handleLocalClick = (local) => {
    router.push(`/local/${local.documentId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
  };

  if (appLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Carregando locais..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <MapPin size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
          </Button>
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
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <Filter size={20} />
              </Button>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-2">Todos os Locais</h1>
            <p className="text-white/90">
              Descubra {filteredLocals.length} locais incríveis em Vilhena
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar locais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-4 space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Categoria</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-white text-green-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/90 backdrop-blur-md rounded-lg border border-white/20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="points">Pontuação (Maior-Menor)</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>

            {/* Clear Filters */}
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="w-full text-white border border-white/20 hover:bg-white/20"
            >
              <X size={16} className="mr-2" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredLocals.length === locals.length 
              ? `${filteredLocals.length} locais encontrados`
              : `${filteredLocals.length} de ${locals.length} locais`
            }
          </p>
          
          {(searchTerm || selectedCategory !== 'all') && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Locals List */}
        {filteredLocals.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum local encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `Nenhum local corresponde à busca "${searchTerm}"`
                : 'Tente ajustar os filtros de busca'
              }
            </p>
            <Button onClick={clearFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 gap-4"
              : "space-y-3"
          }>
            {filteredLocals.map((local) => (
              <div
                key={local.id}
                onClick={() => handleLocalClick(local)}
                className={`bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 ${
                  viewMode === 'grid' ? 'p-4' : 'p-3'
                }`}
              >
                <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} space-x-0 ${viewMode === 'list' ? 'space-x-3' : ''}`}>
                  {/* Image */}
                  <div className={`${viewMode === 'grid' ? 'w-full h-32 mb-3' : 'w-20 h-20 flex-shrink-0'} bg-green-100 rounded-lg overflow-hidden`}>
                    {local.imagens && local.imagens.length > 0 ? (
                      <img
                        src={getStrapiImageUrl(local.imagens[0].url)}
                        alt={local.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="text-green-600" size={viewMode === 'grid' ? 32 : 24} />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-gray-900 ${viewMode === 'grid' ? 'text-lg' : 'text-base'} line-clamp-1`}>
                        {local.nome || 'Local sem nome'}
                      </h3>
                      {viewMode === 'list' && (
                        <Eye size={16} className="text-gray-400 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className={`text-gray-600 mb-3 ${viewMode === 'grid' ? 'text-sm line-clamp-2' : 'text-xs line-clamp-1'}`}>
                      {local.descricao_curta || local.descricao_longa || 'Sem descrição disponível'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Trophy className="text-yellow-500" size={14} />
                          <span className="text-sm font-medium text-gray-700">
                            {local.pontuacao || 0} pts
                          </span>
                        </div>
                        
                        {local.categoria && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {CATEGORIES.find(cat => cat.value === local.categoria)?.label || local.categoria}
                          </span>
                        )}
                      </div>
                      
                      {viewMode === 'grid' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:bg-green-50 p-1"
                        >
                          <Eye size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
