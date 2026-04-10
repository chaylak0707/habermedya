import React, { useEffect, useState } from "react";

type Category = {
  id: number;
  name?: string;
  slug?: string;
};

type Menu = {
  id: number;
  name?: string;
};

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
      });

    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        setMenus(data || []);
      });
  }, []);

  return (
    <div>
      <h2>Kategoriler</h2>
      {categories.map((cat) => (
        <div key={cat.id}>
          {(cat.name || "GENEL").toUpperCase()}
        </div>
      ))}

      <h2>Menüler</h2>
      {menus.map((menu) => (
        <div key={menu.id}>
          {(menu.name || "MENÜ").toUpperCase()}
        </div>
      ))}
    </div>
  );
}
