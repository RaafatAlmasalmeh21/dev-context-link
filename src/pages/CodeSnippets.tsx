import { useState } from 'react';
import { useCodeSnippets } from '@/hooks/useCodeSnippets';
import { CodeSnippetCard } from '@/components/snippets/CodeSnippetCard';
import { CodeSnippetDialog } from '@/components/snippets/CodeSnippetDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Grid3X3, List, Filter, SortAsc, SortDesc, Code2 } from 'lucide-react';
import { Snippet } from '@/types';

export const CodeSnippets = () => {
  const {
    snippets,
    isLoading,
    filters,
    sortOptions,
    setFilters,
    setSortOptions,
    saveSnippet,
    deleteSnippet,
    getLanguageFromPath,
  } = useCodeSnippets();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateSnippet = () => {
    setEditingSnippet(undefined);
    setDialogOpen(true);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setDialogOpen(true);
  };

  const handleSaveSnippet = async (snippetData: Partial<Snippet>) => {
    await saveSnippet(snippetData);
    setDialogOpen(false);
    setEditingSnippet(undefined);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, search: query });
  };

  const languages = Array.from(new Set(snippets.map(s => getLanguageFromPath(s.file_path))));
  const snippetCount = snippets.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Code2 className="h-8 w-8" />
              Code Snippets
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your code snippets efficiently
            </p>
          </div>
          <Button onClick={handleCreateSnippet} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Snippet
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{snippetCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{languages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {snippets.filter(s => {
                  const dayAgo = new Date();
                  dayAgo.setDate(dayAgo.getDate() - 1);
                  return s.created_at > dayAgo;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search snippets by path or content..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Language Filter */}
              <Select
                value={filters.language || 'all'}
                onValueChange={(value) => 
                  setFilters({ ...filters, language: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select
                  value={sortOptions.field}
                  onValueChange={(value) => 
                    setSortOptions({ ...sortOptions, field: value as any })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date</SelectItem>
                    <SelectItem value="file_path">Path</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => 
                    setSortOptions({ 
                      ...sortOptions, 
                      order: sortOptions.order === 'asc' ? 'desc' : 'asc' 
                    })
                  }
                >
                  {sortOptions.order === 'asc' ? 
                    <SortAsc className="h-4 w-4" /> : 
                    <SortDesc className="h-4 w-4" />
                  }
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-muted rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.search || filters.language) && (
              <div className="flex gap-2 mt-4">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({ ...filters, search: undefined });
                      }}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.language && (
                  <Badge variant="secondary" className="gap-1">
                    Language: {filters.language}
                    <button
                      onClick={() => setFilters({ ...filters, language: undefined })}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Snippets Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-muted-foreground">Loading snippets...</div>
          </div>
        ) : snippets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No snippets found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.language 
                  ? "Try adjusting your filters to see more results."
                  : "Create your first code snippet to get started."
                }
              </p>
              {!filters.search && !filters.language && (
                <Button onClick={handleCreateSnippet} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Snippet
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }>
            {snippets.map((snippet) => (
              <CodeSnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={() => handleEditSnippet(snippet)}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <CodeSnippetDialog
          snippet={editingSnippet}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveSnippet}
        />
      </div>
    </div>
  );
};