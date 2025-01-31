import React, { useState } from 'react';

function Sidebar({ onViewChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(prevState => !prevState);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button id="sidebar-toggle" className="material-symbols-rounded" onClick={toggleSidebar}>
        {isCollapsed ? 'menu' : 'close'}
      </button>   
      <div className="nav-buttons">
        <li><a href="#" onClick={() => onViewChange('products')}><i className="material-icons">inventory_2</i><span>Inventario</span></a></li>
        <li><a href="#" onClick={() => onViewChange('sales')}><i className="material-icons">analytics</i><span>Ventas</span></a></li>
        <li><a href="#" onClick={() => onViewChange('orders')}><i className="material-icons">local_shipping</i><span>Pedidos</span></a></li>
        <li><a href="#" onClick={() => onViewChange('atm')}><i className="material-icons">local_mall</i><span>Caja</span></a></li>
      </div> 
    </div>
  );
}

export default Sidebar;
