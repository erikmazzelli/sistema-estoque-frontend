'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

export default function ProdutosPorCategoria() {
  const { categoriaId } = useParams();
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [categoriaNome, setCategoriaNome] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [tipoMovimento, setTipoMovimento] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: '',
    quantidadeMinima: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPrecoMin, setFiltroPrecoMin] = useState('');
  const [filtroPrecoMax, setFiltroPrecoMax] = useState('');

  const { user } = useAuth();

  const fetchProdutos = async () => {
    try {
      const res = await fetch(
        `${process.env.API_DOMAIN}:${process.env.API_PORT}/produtos`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      const data = await res.json();
      const filtrados = data?.filter(
        p => String(p.categoria_id) === String(categoriaId)
      );
      setProdutos(filtrados);
      setProdutosFiltrados(filtrados);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!categoriaId || !user?.token) return;

    const fetchDados = async () => {
      await fetchProdutos();

      try {
        const categoriaRes = await fetch(
          `${process.env.API_DOMAIN}:${process.env.API_PORT}/categorias/${categoriaId}`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );

        const categoriaData = await categoriaRes.json();
        setCategoriaNome(categoriaData.nome || 'Categoria');
      } catch (error) {
        console.error('Erro ao carregar categoria:', error);
      }
    };

    fetchDados();
  }, [categoriaId, user?.token]);

  // Atualiza a lista filtrada sempre que produtos ou filtros mudarem
  useEffect(() => {
    let lista = produtos;

    if (filtroNome.trim()) {
      const termo = filtroNome.trim().toLowerCase();
      lista = lista.filter(p => p.nome.toLowerCase().includes(termo));
    }
    if (filtroPrecoMin !== '') {
      const min = parseFloat(filtroPrecoMin);
      if (!isNaN(min)) lista = lista.filter(p => p.preco >= min);
    }
    if (filtroPrecoMax !== '') {
      const max = parseFloat(filtroPrecoMax);
      if (!isNaN(max)) lista = lista.filter(p => p.preco <= max);
    }

    setProdutosFiltrados(lista);
  }, [filtroNome, filtroPrecoMin, filtroPrecoMax, produtos]);

  const abrirModalMovimento = (produto, tipo) => {
    setProdutoSelecionado(produto);
    setTipoMovimento(tipo);
    setModalMovimentoAberto(true);
  };

  const abrirModalEdicao = produto => {
    setProdutoSelecionado(produto);
    setFormProduto({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      quantidade: produto.quantidade,
      quantidadeMinima: produto.quantidade_minima,
    });
    setModalEdicaoAberto(true);
  };

  const abrirModalExclusao = produto => {
    setProdutoSelecionado(produto);
    setModalExclusaoAberto(true);
  };

  const fecharTodosModais = () => {
    setModalMovimentoAberto(false);
    setModalEdicaoAberto(false);
    setModalCriacaoAberto(false);
    setModalExclusaoAberto(false);
    setProdutoSelecionado(null);
    setFormProduto({ nome: '', descricao: '', preco: '', quantidade: '' });
    setQuantidade('');
    setObservacao('');
  };

  const registrarMovimento = async () => {
    try {
      const res = await fetch(
        `${process.env.API_DOMAIN}:${process.env.API_PORT}/movimentos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            produto_id: produtoSelecionado.id,
            tipo_movimento: tipoMovimento,
            quantidade: parseInt(quantidade),
            observacao,
          }),
        }
      );

      if (!res.ok) throw new Error('Erro ao registrar movimento');
      setSnackbar({
        open: true,
        message: 'Movimento registrado com sucesso',
        severity: 'success',
      });
      await fetchProdutos();
      fecharTodosModais();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const salvarProduto = async () => {
    try {
      const metodo = modalCriacaoAberto ? 'POST' : 'PUT';
      const url = modalCriacaoAberto
        ? `${process.env.API_DOMAIN}:${process.env.API_PORT}/produtos`
        : `${process.env.API_DOMAIN}:${process.env.API_PORT}/produtos/${produtoSelecionado.id}`;

      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          descricao: formProduto.descricao,
          nome: formProduto.nome,
          preco: parseFloat(formProduto.preco),
          quantidade: parseInt(formProduto.quantidade),
          categoria_id: categoriaId,
          quantidade_minima: parseInt(formProduto.quantidadeMinima),
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar produto');
      setSnackbar({
        open: true,
        message: 'Produto salvo com sucesso',
        severity: 'success',
      });
      await fetchProdutos();
      fecharTodosModais();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const excluirProduto = async () => {
    try {
      const res = await fetch(
        `${process.env.API_DOMAIN}:${process.env.API_PORT}/produtos/${produtoSelecionado.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      if (!res.ok) throw new Error('Erro ao excluir produto');
      setSnackbar({
        open: true,
        message: 'Produto excluído com sucesso',
        severity: 'success',
      });
      await fetchProdutos();
      fecharTodosModais();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box p={3}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>Produtos - {categoriaNome}</Typography>
        <Box display='flex' gap={1}>
          <Button onClick={() => router.back()} variant='outlined'>
            Voltar
          </Button>
          <Button
            onClick={() => setModalCriacaoAberto(true)}
            variant='contained'
          >
            Novo Produto
          </Button>
        </Box>
      </Box>

      <Box mb={3} display='flex' gap={2} flexWrap='wrap'>
        <TextField
          label='Buscar nome'
          value={filtroNome}
          onChange={e => setFiltroNome(e.target.value)}
          size='small'
        />
        <TextField
          label='Preço mínimo'
          type='number'
          value={filtroPrecoMin}
          onChange={e => setFiltroPrecoMin(e.target.value)}
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>R$</InputAdornment>
            ),
          }}
        />
        <TextField
          label='Preço máximo'
          type='number'
          value={filtroPrecoMax}
          onChange={e => setFiltroPrecoMax(e.target.value)}
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>R$</InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map(produto => (
            <Grid item xs={12} md={6} lg={4} key={produto.id}>
              <Card>
                <CardContent>
                  <Typography variant='h6'>{produto.nome}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {produto.descricao}
                  </Typography>
                  <Typography>Preço: R$ {produto.preco}</Typography>
                  <Typography>Estoque: {produto.quantidade}</Typography>
                  <Box mt={2} display='flex' gap={1} flexWrap='wrap'>
                    <Button
                      size='small'
                      onClick={() => abrirModalMovimento(produto, 'entrada')}
                    >
                      Entrada
                    </Button>
                    <Button
                      size='small'
                      onClick={() => abrirModalMovimento(produto, 'saida')}
                    >
                      Saída
                    </Button>
                    <Button
                      size='small'
                      onClick={() => abrirModalMovimento(produto, 'ajuste')}
                    >
                      Ajuste
                    </Button>
                    <Button
                      size='small'
                      onClick={() => abrirModalEdicao(produto)}
                      color='primary'
                    >
                      Editar
                    </Button>
                    <Button
                      size='small'
                      onClick={() => abrirModalExclusao(produto)}
                      color='error'
                    >
                      Excluir
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>Nenhum produto encontrado.</Typography>
          </Grid>
        )}
      </Grid>

      {/* Modal de Movimento */}
      <Dialog open={modalMovimentoAberto} onClose={fecharTodosModais}>
        <DialogTitle>Registrar {tipoMovimento}</DialogTitle>
        <DialogContent>
          <TextField
            label='Quantidade'
            fullWidth
            type='number'
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
            margin='normal'
          />
          <TextField
            label='Observação'
            fullWidth
            multiline
            rows={3}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            margin='normal'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharTodosModais}>Cancelar</Button>
          <Button onClick={registrarMovimento} variant='contained'>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Criar/Editar Produto */}
      <Dialog
        open={modalEdicaoAberto || modalCriacaoAberto}
        onClose={fecharTodosModais}
      >
        <DialogTitle>
          {modalCriacaoAberto ? 'Novo Produto' : 'Editar Produto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Nome'
            fullWidth
            value={formProduto.nome}
            onChange={e =>
              setFormProduto({ ...formProduto, nome: e.target.value })
            }
            margin='normal'
          />
          <TextField
            label='Descrição'
            fullWidth
            value={formProduto.descricao}
            onChange={e =>
              setFormProduto({ ...formProduto, descricao: e.target.value })
            }
            margin='normal'
          />
          <TextField
            label='Preço'
            fullWidth
            type=''
            value={formProduto.preco}
            onChange={e =>
              setFormProduto({ ...formProduto, preco: e.target.value })
            }
            margin='normal'
          />
          <TextField
            label='Quantidade'
            fullWidth
            type='number'
            value={formProduto.quantidade}
            onChange={e =>
              setFormProduto({ ...formProduto, quantidade: e.target.value })
            }
            margin='normal'
          />
          <TextField
            label='Quantidade mínima'
            fullWidth
            type='number'
            value={formProduto.quantidadeMinima}
            onChange={e =>
              setFormProduto({
                ...formProduto,
                quantidadeMinima: e.target.value,
              })
            }
            margin='normal'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharTodosModais}>Cancelar</Button>
          <Button onClick={salvarProduto} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={modalExclusaoAberto} onClose={fecharTodosModais}>
        <DialogTitle>Excluir Produto</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o produto{' '}
            <strong>{produtoSelecionado?.nome}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharTodosModais}>Cancelar</Button>
          <Button onClick={excluirProduto} variant='contained' color='error'>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
