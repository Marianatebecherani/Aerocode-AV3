import { LucideIcon } from 'lucide-react';

// Tipo de Utilizador
export interface User {
  id: number | string;
  username: string;
  role: 'admin' | 'engenheiro' | 'operador';
  name: string; // Padronizei para 'name' (estava misturado com 'nome')
}

// Tipo para Itens de Inventário
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
  statusType: 'success' | 'warning' | 'error';
}

// Tipo para Itens de QC
export interface QcItem {
  id: number;
  componenteId: string;
  inspetor: string;
  data: string;
  status: 'Aprovado' | 'Reprovado' | 'Em Espera';
  notas: string;
}

// Tipos para KPIs
export interface KpiData {
  id: number | string;
  title: string;
  value: string | number;
  icon?: LucideIcon; // Icon opcional para evitar erros se não passar
  color?: 'red' | 'gray' | 'blue' | 'green' | 'yellow';
}

// Tipo para Etapas (Steps) dentro de um projeto
export interface ProjectStep {
  id: number | string;
  title: string;
  status: string;
  icon?: LucideIcon;
  tasks: string[];
}

// Tipo Principal do Projeto (Para listagem e Dashboard)
export interface Project {
  id: string;         // ex: '04-EMB'
  title: string;      // ex: 'Pedido 04-EMB (Embraer E2)'
  status: string;     // ex: 'Em Operação'
  idNumber: string;   // ex: 'ID #A0440'
  value: string;      // ex: 'R$ 35.5M'
  progress: number;   // 0 a 100
  statusType: 'success' | 'warning' | 'error' | 'pending';
  steps?: ProjectStep[]; // Opcional, vira do backend depois
}

// Tipo para os Subcomponentes
export interface SubComponent {
  id: number;
  title: string;
  icon: LucideIcon;
  status: string;
  lastUpdate: string;
  statusType: 'success' | 'error' | 'warning';
}