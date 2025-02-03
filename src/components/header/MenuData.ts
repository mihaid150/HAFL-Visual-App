interface MenuItem {
    id: number;
    title: string;
    path: string;
}

const menuData: MenuItem[] = [
    {
        id: 1,
        title: "Network",
        path: "/network",
    },
    {
        id: 2,
        title: "Simulation",
        path: "/simulation",
    }
];

export default menuData;