import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, PlusCircle, CheckSquare, XSquare, AlertTriangle } from 'lucide-react';
import { QcItem } from '../types'; // Importamos o tipo

const mockData: QcItem[] = [
  { id: 1, componenteId: 'Asa-E2-001L', inspetor: 'J. Silva', data: '2025-11-06', status: 'Reprovado', notas: 'Microfissura.' },
  { id: 2, componenteId: 'Asa-E2-001R', inspetor: 'J. Silva', data: '2025-11-05', status: 'Aprovado', notas: '' },
];

const ControleDeQualidade: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<QcItem[]>(mockData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  
  const newItemTemplate: QcItem = {
    id: 0, // Temporário
    componenteId: '',
    inspetor: '',
    data: new Date().toISOString().split('T')[0],
    status: 'Em Espera',
    notas: '',
  };
  const [formData, setFormData] = useState<QcItem>(newItemTemplate);

  const canEdit = useMemo(() => {
    return user && (user.role === 'admin' || user.role === 'engenheiro');
  }, [user]);

  const openModal = (mode: 'add' | 'edit', item: QcItem | null = null) => {
    setIsModalOpen(true);
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setFormData(item);
      setCurrentItemId(item.id);
    } else {
      setFormData(newItemTemplate);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // Tipagem correta para eventos de input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (modalMode === 'add') {
      setItems((prev) => [...prev, { ...formData, id: Date.now() }]);
    } else {
      setItems((prev) => prev.map((item) => (item.id === currentItemId ? formData : item)));
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (!canEdit) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300"><CheckSquare className="w-3.5 h-3.5"/> {status}</span>;
      case 'Reprovado':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300"><XSquare className="w-3.5 h-3.5"/> {status}</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300"><AlertTriangle className="w-3.5 h-3.5"/> {status}</span>;
    }
  };

  return (
    <div className="text-white">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Controlo de Qualidade (QC)</h1>
          <p className="text-gray-400 mt-1">Gestão de inspeções.</p>
        </div>
        {canEdit && (
          <button onClick={() => openModal('add')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            <PlusCircle className="w-5 h-5" /> Novo Registo
          </button>
        )}
      </header>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID Componente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Inspetor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
              {canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-750">
                <td className="px-6 py-4 text-sm font-medium text-gray-200">{item.componenteId}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{item.inspetor}</td>
                <td className="px-6 py-4 text-sm">{getStatusBadge(item.status)}</td>
                {canEdit && (
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => openModal('edit', item)} className="text-blue-400 mr-4"><Edit className="w-5 h-5"/></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-5 h-5"/></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal omitido por brevidade, use a estrutura do JSX anterior dentro do bloco isModalOpen */}
      {/* Apenas certifique-se que os inputs usam: onChange={handleChange} e value={formData.campo} */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-white">Registo de QC</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="componenteId" value={formData.componenteId} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded" placeholder="ID Componente" required />
                    <input name="inspetor" value={formData.inspetor} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded" placeholder="Inspetor" required />
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-700 text-white p-2 rounded">
                        <option>Em Espera</option>
                        <option>Aprovado</option>
                        <option>Reprovado</option>
                    </select>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={closeModal} className="text-gray-300">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default ControleDeQualidade;