interface MenuItem {
    id: number;
    title: string;
    path: string;
}

const menuData: MenuItem[] = [
    {
        id: 1,
        title: "Simulation",
        path: "/simulation",
    },
    {
        id: 2,
        title: "Network",
        path: "/network",
    }
];

export default menuData;