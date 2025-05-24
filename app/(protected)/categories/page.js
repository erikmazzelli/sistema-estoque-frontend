'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackBarContext';

export default function Categorias() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editarCategoria, setEditarCategoria] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    buscarCategorias();
  }, []);

  async function buscarCategorias() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.API_DOMAIN}/categorias`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error();
      const dados = await res.json();
      setCategorias(dados);
    } catch {
      showSnackbar('Erro ao carregar categorias', 'error');
    } finally {
      setLoading(false);
    }
  }

  function abrirDialogCriar() {
    setEditarCategoria(null);
    setNome('');
    setDescricao('');
    setOpenDialog(true);
  }

  function abrirDialogEditar(categoria) {
    setEditarCategoria(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || '');
    setOpenDialog(true);
  }

  function fecharDialog() {
    setOpenDialog(false);
  }

  async function salvarCategoria() {
    if (!nome.trim()) {
      showSnackbar('Nome é obrigatório', 'error');
      return;
    }

    setLoading(true);

    const metodo = editarCategoria ? 'PUT' : 'POST';
    const url = editarCategoria
      ? `${process.env.API_DOMAIN}/categorias/${editarCategoria.id}`
      : `${process.env.API_DOMAIN}/categorias`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ nome, descricao }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Erro ao salvar categoria');
      }

      fecharDialog();
      buscarCategorias();

      showSnackbar(
        editarCategoria
          ? 'Categoria atualizada com sucesso'
          : 'Categoria criada com sucesso',
        'success'
      );
    } catch (err) {
      showSnackbar(err.message || 'Erro ao salvar categoria', 'error');
    } finally {
      setLoading(false);
    }
  }

  function abrirConfirmDeleteCategoria(categoria) {
    setCategoriaParaExcluir(categoria);
    setOpenConfirmDelete(true);
  }

  function fecharConfirmDelete() {
    setOpenConfirmDelete(false);
  }

  async function excluirCategoria() {
    if (!categoriaParaExcluir) return;

    try {
      const res = await fetch(
        `${process.env.API_DOMAIN}/categorias/${categoriaParaExcluir.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Erro ao excluir categoria');
      }

      fecharConfirmDelete();
      buscarCategorias();
      showSnackbar('Categoria excluída com sucesso', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Erro ao excluir categoria', 'error');
    }
  }

  function formatarData(dataStr) {
    if (!dataStr) return 'Indisponível';
    const data = new Date(dataStr);
    return data.toLocaleDateString();
  }

  return (
    <Box p={3}>
      <Stack direction='row' alignItems='center' gap={4}>
        <Typography variant='h4' gutterBottom>
          Categorias
        </Typography>

        <Button variant='contained' onClick={abrirDialogCriar} sx={{ mb: 2 }}>
          Criar Categoria
        </Button>
      </Stack>

      {loading ? (
        <Box display='flex' justifyContent='center' p={6}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {categorias.map(categoria => (
            <ListItem
              key={categoria.id}
              divider
              component={ListItemButton}
              onClick={() =>
                router.push(`/categories/products/${categoria.id}`)
              }
              secondaryAction={
                <Stack
                  direction='row'
                  spacing={1}
                  onClick={e => e.stopPropagation()}
                >
                  <IconButton
                    edge='end'
                    aria-label='editar'
                    onClick={() => abrirDialogEditar(categoria)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge='end'
                    aria-label='excluir'
                    onClick={() => abrirConfirmDeleteCategoria(categoria)}
                  >
                    <DeleteIcon color='error' />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={categoria.nome}
                secondary={
                  <>
                    {categoria.descricao ? categoria.descricao + ' — ' : ''}
                    Criada em: {formatarData(categoria.data_criacao)}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={fecharDialog}>
        <DialogTitle>
          {editarCategoria ? 'Editar Categoria' : 'Criar Categoria'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            type='text'
            label='Nome'
            fullWidth
            value={nome}
            required
            onChange={e => setNome(e.target.value)}
          />
          <TextField
            margin='dense'
            label='Descrição'
            multiline
            rows={4}
            fullWidth
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={salvarCategoria}
            variant='contained'
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {editarCategoria ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDelete} onClose={fecharConfirmDelete}>
        <DialogTitle>Confirma exclusão?</DialogTitle>
        <DialogContent />
        <DialogActions>
          <Button onClick={fecharConfirmDelete}>Cancelar</Button>
          <Button onClick={excluirCategoria} variant='contained' color='error'>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
