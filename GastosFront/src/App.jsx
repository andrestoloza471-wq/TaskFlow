import { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]); 
  const [nueva, setNueva] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [filtro, setFiltro] = useState("");
  const [nuevoUser, setNuevoUser] = useState({ username: '', password: '', rol: 'Usuario' });

  const API = "http://localhost:5191/api";

  const cargarDatos = async () => {
    if (!user) return;
    const resT = await fetch(`${API}/tareas/${user.id}/${user.rol}`);
    setTasks(await resT.json());
    if (user.rol === "Admin") {
      const resU = await fetch(`${API}/usuarios`);
      setUsersList(await resU.json());
    }
  };

  useEffect(() => { cargarDatos(); }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(auth)
    });
    if(res.ok) setUser(await res.json());
    else alert("Error de acceso");
  };

  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!nueva.trim()) return;
    await fetch(`${API}/tareas`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        titulo: nueva, 
        prioridad: prioridad, 
        usuarioId: user.rol === "Admin" ? 0 : user.id, // Admin crea para todos
        completada: false
      })
    });
    setNueva("");
    cargarDatos();
  };

  const completarTarea = async (id) => {
    await fetch(`${API}/tareas/completar/${id}`, { method: 'PUT' });
    cargarDatos();
  };

  const eliminarTarea = async (id) => {
    await fetch(`${API}/tareas/${id}/${user.rol}`, { method: 'DELETE' });
    cargarDatos();
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    await fetch(`${API}/usuarios`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(nuevoUser)
    });
    alert("Personal registrado");
    setNuevoUser({ username: '', password: '', rol: 'Usuario' });
    cargarDatos();
  };

  const tareasFiltradas = tasks.filter(t => t.titulo.toLowerCase().includes(filtro.toLowerCase()));

  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 w-full max-w-sm shadow-2xl shadow-blue-500/10">
        <h2 className="text-3xl font-black text-white mb-2 text-center italic tracking-tighter">TASKFLOW <span className="text-blue-500">PRO</span></h2>
        <p className="text-slate-500 text-xs text-center mb-8 uppercase tracking-widest font-bold">Control de Operaciones</p>
        <div className="space-y-4">
          <input type="text" placeholder="ID de Usuario" className="w-full bg-slate-950 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-800" onChange={e => setAuth({...auth, username: e.target.value})} />
          <input type="password" placeholder="Contraseña" className="w-full bg-slate-950 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-800" onChange={e => setAuth({...auth, password: e.target.value})} />
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20">ACCEDER AL SISTEMA</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-slate-900 p-6 rounded-[2rem] border border-slate-800 mb-8 shadow-xl">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-3xl font-black text-blue-500 tracking-tighter">TASKFLOW PRO</h1>
          <p className="text-slate-400 text-xs">Operador: <span className="text-white font-bold uppercase">{user.username}</span> | {tasks.length} Tareas Activas</p>
        </div>
        <button onClick={() => setUser(null)} className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all border border-red-500/20">CERRAR SESIÓN</button>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: AGREGAR Y FILTRAR */}
        <section className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-lg">
            <h3 className="text-sm font-black mb-4 text-blue-400 uppercase tracking-widest">Nueva Tarea</h3>
            <form onSubmit={agregarTarea} className="space-y-3">
              <input value={nueva} onChange={e => setNueva(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500" placeholder="¿Qué hay que hacer?" />
              <select className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs" value={prioridad} onChange={e => setPrioridad(e.target.value)}>
                <option value="Baja">Prioridad Baja</option>
                <option value="Media">Prioridad Media</option>
                <option value="Alta">Prioridad Alta</option>
              </select>
              <button className="w-full bg-blue-600 p-3 rounded-xl font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-500">AÑADIR A LA LISTA</button>
            </form>
          </div>

          <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800">
            <h3 className="text-sm font-black mb-4 text-slate-500 uppercase tracking-widest">Buscador</h3>
            <input type="text" placeholder="Filtrar tareas..." className="w-full bg-transparent border-b border-slate-800 p-2 outline-none focus:border-blue-500 transition-all" onChange={e => setFiltro(e.target.value)} />
          </div>
        </section>

        {/* COLUMNA CENTRAL: LISTA DE TAREAS */}
        <section className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-black mb-6 px-2 italic">TABLERO DE MANDO</h2>
          {tareasFiltradas.map(t => (
            <div key={t.id} className={`p-5 rounded-3xl border transition-all ${t.completada ? 'bg-slate-900/30 border-slate-800 opacity-50' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${t.prioridad === 'Alta' ? 'bg-red-500/20 text-red-500' : t.prioridad === 'Media' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                  {t.prioridad}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => completarTarea(t.id)} className="text-slate-500 hover:text-green-500">✓</button>
                  {user.rol === "Admin" && <button onClick={() => eliminarTarea(t.id)} className="text-slate-500 hover:text-red-500">✕</button>}
                </div>
              </div>
              <p className={`font-bold ${t.completada ? 'line-through text-slate-600' : 'text-slate-200'}`}>{t.titulo}</p>
              {t.usuarioId === 0 && <span className="text-[9px] text-blue-500 font-bold uppercase mt-2 block">🌍 Global (Admin)</span>}
            </div>
          ))}
        </section>

        {/* COLUMNA DERECHA: PANEL ADMIN */}
        {user.rol === "Admin" && (
          <section className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] h-fit">
            <h2 className="text-lg font-black mb-6 text-blue-400 uppercase italic">Gestión de Personal</h2>
            <form onSubmit={crearUsuario} className="mb-8 space-y-2">
              <input type="text" placeholder="Nuevo Usuario" className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800" onChange={e => setNuevoUser({...nuevoUser, username: e.target.value})} />
              <input type="password" placeholder="Contraseña" className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800" onChange={e => setNuevoUser({...nuevoUser, password: e.target.value})} />
              <button className="w-full bg-white text-black p-3 rounded-xl font-black text-xs hover:bg-blue-400 transition-colors">REGISTRAR EN SISTEMA</button>
            </form>
            <div className="space-y-2">
              {usersList.map(u => (
                <div key={u.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px]">
                  <span className="font-bold">{u.username}</span>
                  <span className="text-blue-500 font-black uppercase">{u.rol}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}