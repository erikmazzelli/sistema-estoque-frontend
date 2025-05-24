'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  TextField,
  useTheme,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function DashboardPage() {
  const [movimentos, setMovimentos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroData, setFiltroData] = useState('');

  const theme = useTheme();

  const { user } = useAuth();

  const COLOR_BY_TYPE = {
    Entrada: theme.palette.success.main,
    Saida: theme.palette.error.main,
    Ajuste: theme.palette.warning.main,
  };

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const res = await fetch(`${process.env.API_DOMAIN}/categorias`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setCategorias(data);
      } catch (e) {
        console.error('Erro ao buscar categorias', e);
      }
    }
    fetchCategorias();
  }, [user?.token]);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await fetch(`${process.env.API_DOMAIN}/produtos`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setProdutos(data);
      } catch (e) {
        console.error('Erro ao buscar produtos', e);
      }
    }
    fetchProdutos();
  }, [user?.token]);

  useEffect(() => {
    async function fetchMovimentos() {
      setCarregando(true);
      try {
        const params = new URLSearchParams();
        if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
        if (filtroCategoria !== 'todos')
          params.append('categoria_id', filtroCategoria);
        if (filtroData) params.append('data', filtroData);

        const url = `${process.env.API_DOMAIN}/movimentos?${params.toString()}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setMovimentos(data);
      } catch (e) {
        console.error('Erro ao buscar movimentos', e);
        setMovimentos([]);
      } finally {
        setCarregando(false);
      }
    }
    fetchMovimentos();
  }, [filtroTipo, filtroCategoria, filtroData, user?.token]);

  const dadosPorTipo = movimentos?.reduce((acc, mov) => {
    const tipo = capitalize(mov.tipo_movimento);
    const item = acc.find(i => i.tipo === tipo);
    if (item) item.quantidade += mov.quantidade;
    else acc.push({ tipo, quantidade: mov.quantidade });
    return acc;
  }, []);

  const produtosFiltrados =
    filtroCategoria === 'todos'
      ? produtos
      : produtos.filter(
          p => p.categoria_id.toString() === filtroCategoria.toString()
        );

  const dadosProdutosPorCategoria = produtosFiltrados.map(p => ({
    nome: capitalize(p.nome),
    estoque: p.quantidade,
  }));

  const dadosPorData = movimentos
    .reduce((acc, mov) => {
      const dataFmt = dayjs(mov.data_movimento).format('DD/MM');
      const item = acc.find(i => i.data === dataFmt);
      if (item) item.quantidade += mov.quantidade;
      else acc.push({ data: dataFmt, quantidade: mov.quantidade });
      return acc;
    }, [])
    .sort((a, b) => {
      const [dA, mA] = a.data.split('/').map(Number);
      const [dB, mB] = b.data.split('/').map(Number);
      return mA - mB || dA - dB;
    });

  return (
    <Box p={3}>
      <Typography variant='h4' gutterBottom>
        Dashboard
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant='h6' gutterBottom>
          Filtros
        </Typography>
        <Box display='flex' gap={2} flexWrap='wrap' alignItems='center'>
          <ToggleButtonGroup
            size='small'
            exclusive
            value={filtroTipo}
            onChange={(_, val) => val !== null && setFiltroTipo(val)}
          >
            <ToggleButton value='todos'>Todos os tipos</ToggleButton>
            <ToggleButton value='entrada'>Entradas</ToggleButton>
            <ToggleButton value='saida'>Saídas</ToggleButton>
            <ToggleButton value='ajuste'>Ajustes</ToggleButton>
          </ToggleButtonGroup>

          <Select
            size='small'
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value='todos'>Todas categorias</MenuItem>
            {categorias?.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>
                {capitalize(cat.nome)}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label='Data'
            type='date'
            size='small'
            InputLabelProps={{ shrink: true }}
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
          />
        </Box>
      </Paper>

      {carregando ? (
        <Box display='flex' justifyContent='center' p={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 5 }}>
            <Typography variant='h6' gutterBottom>
              Movimentações por tipo
            </Typography>
            {dadosPorTipo.length === 0 ? (
              <Typography color='textSecondary' fontStyle='italic'>
                Nenhuma movimentação encontrada para os filtros selecionados.
              </Typography>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={dadosPorTipo}
                    dataKey='quantidade'
                    nameKey='tipo'
                    outerRadius={100}
                    fill={theme.palette.primary.main}
                    label={({ tipo }) => tipo}
                  >
                    {dadosPorTipo.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLOR_BY_TYPE[entry.tipo] ||
                          theme.palette.primary.main
                        }
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <ReLegend verticalAlign='bottom' height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 5 }}>
            <Typography variant='h6' gutterBottom>
              Produtos{' '}
              {filtroCategoria !== 'todos'
                ? `da categoria "${capitalize(
                    categorias.find(
                      c => c.id.toString() === filtroCategoria.toString()
                    )?.nome || ''
                  )}"`
                : 'por categoria'}
            </Typography>
            {dadosProdutosPorCategoria.length === 0 ? (
              <Typography color='textSecondary' fontStyle='italic'>
                Nenhum produto encontrado para os filtros selecionados.
              </Typography>
            ) : (
              <ResponsiveContainer width='100%' height={400}>
                <BarChart
                  data={dadosProdutosPorCategoria}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='nome'
                    angle={-45}
                    textAnchor='end'
                    interval={0}
                    height={70}
                  />
                  <YAxis />
                  <ReTooltip />
                  <Bar dataKey='estoque' fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Movimentações por data
            </Typography>
            {dadosPorData.length === 0 ? (
              <Typography color='textSecondary' fontStyle='italic'>
                Nenhuma movimentação encontrada para os filtros selecionados.
              </Typography>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <LineChart
                  data={dadosPorData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='data' />
                  <YAxis />
                  <ReTooltip />
                  <ReLegend verticalAlign='top' height={36} />
                  <Line
                    type='monotone'
                    dataKey='quantidade'
                    stroke={theme.palette.secondary.main}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}
