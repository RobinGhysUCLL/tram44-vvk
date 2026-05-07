// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  LogOut,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Ticket,
  DollarSign,
  Mail,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  X,
  Bell,
  Send,
  Calendar,
} from "lucide-react";
import { Order } from "@/lib/orders";
import {
  fetchAllOrders,
  toggleOrderPaidStatus,
  deleteOrder,
} from "@/lib/utils";
import React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/vvk", "");

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "name" | "tickets">("date");
  const [filterReferer, setFilterReferer] = useState<string>("all");
  const [filterPaid, setFilterPaid] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [togglingOrderId, setTogglingOrderId] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [eventDate, setEventDate] = useState("2026-02-13");
  const [eventName, setEventName] = useState("Club44");
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
      loadOrders();
    }
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      // alert("Kon bestellingen niet laden. Probeer het opnieuw.");
    }
  };

  const togglePaidStatus = async (orderId: string) => {
    if (togglingOrderId) return; // Voorkom dubbele clicks

    setTogglingOrderId(orderId);
    try {
      const updatedOrder = await toggleOrderPaidStatus(orderId);
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
    } catch (error) {
      console.error("Failed to toggle paid status:", error);
      alert("Kon betaalstatus niet wijzigen. Probeer het opnieuw.");
    } finally {
      setTogglingOrderId(null);
    }
  };

  const toggleExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const openDeleteModal = (orderId: string, orderName: string) => {
    setOrderToDelete({ id: orderId, name: orderName });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete || deletingOrder) return;

    setDeletingOrder(true);
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      const newExpanded = new Set(expandedOrders);
      newExpanded.delete(orderToDelete.id);
      setExpandedOrders(newExpanded);
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Kon bestelling niet verwijderen. Probeer het opnieuw.");
    } finally {
      setDeletingOrder(false);
    }
  };

  const openReminderModal = () => {
    setReminderModalOpen(true);
  };

  const closeReminderModal = () => {
    setReminderModalOpen(false);
    setEventDate("2026-02-13");
    setEventName("Club44 2026");
  };

  const sendPaymentReminders = async () => {
    if (sendingReminders) return;

    setSendingReminders(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/vvk/send-reminders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventDate: eventDate,
          eventName: eventName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reminders");
      }

      const result = await response.json();
      alert(`✅ ${result.message || "Reminders succesvol verzonden!"}`);
      closeReminderModal();
    } catch (error) {
      console.error("Failed to send reminders:", error);
      alert("❌ Kon reminders niet verzenden. Probeer het opnieuw.");
    } finally {
      setSendingReminders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    // Verwijder oude token VOOR nieuwe login
    sessionStorage.removeItem("adminToken");

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Incorrecte inloggegevens");
        return;
      }

      const data = await response.json();

      if (data.token) {
        // Sla NIEUWE token expliciet op
        sessionStorage.setItem("adminToken", data.token);
        setIsAuthenticated(true);
        await loadOrders();
      } else {
        setError("Geen token ontvangen");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Incorrecte inloggegevens");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Auto-refresh elke 10 seconden
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    // Verwijder ALLE relevante sessionStorage items
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("pendingOrder");
    sessionStorage.removeItem("failedOrder");
    sessionStorage.removeItem("lastOrderId");

    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setOrders([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">
              Log in om bestellingen te beheren
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {error}
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                    Inloggen...
                  </>
                ) : (
                  "Inloggen"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Statistics
  const totalOrders = orders.length;
  const totalTickets = orders.reduce(
    (sum, order) => sum + order.ticketCount,
    0,
  );
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const paidOrders = orders.filter((o) => o.paid).length;
  const unpaidOrders = totalOrders - paidOrders;
  const unpaidRevenue = orders
    .filter((o) => !o.paid)
    .reduce((sum, order) => sum + order.totalPrice, 0);
  const uniqueReferers = [
    ...new Set(
      orders
        .map((o) => o.referer)
        .filter((ref): ref is string => ref !== null && ref !== undefined),
    ),
  ];

  // Filtering & Sorting
  let filteredOrders = orders;

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.additionalNames.some((name) =>
          name.toLowerCase().includes(query),
        ),
    );
  }

  if (filterReferer !== "all") {
    filteredOrders = filteredOrders.filter((o) => o.referer === filterReferer);
  }
  if (filterPaid !== "all") {
    filteredOrders = filteredOrders.filter((o) =>
      filterPaid === "paid" ? o.paid : !o.paid,
    );
  }

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "tickets":
        return b.ticketCount - a.ticketCount;
      case "date":
      default:
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }
  });

  const exportToCSV = () => {
    const headers = [
      "Datum",
      "Naam",
      "Email",
      "Tickets",
      "Extra Namen",
      "Organisatie",
      "Referentie",
      "Bedrag",
      "Betaald",
      "Order ID",
    ];
    const rows = sortedOrders.map((order) => [
      new Date(order.timestamp).toLocaleString("nl-NL"),
      order.name,
      order.email,
      order.ticketCount,
      order.additionalNames.filter((n) => n.trim()).join("; ") || "-",
      order.organization || "-",
      order.referer || "general",
      `€${order.totalPrice.toFixed(2)}`,
      order.paid ? "Ja" : "Nee",
      order.id,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `club44-bestellingen-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-400 mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Club44 2026 Bestellingen
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={openReminderModal}
              size="sm"
              disabled={unpaidOrders === 0}
              title={
                unpaidOrders === 0
                  ? "Geen onbetaalde bestellingen"
                  : "Stuur betalingsherinnering"
              }
            >
              <Bell className="h-4 w-4 mr-2" />
              Reminders ({unpaidOrders})
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6 pb-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">TOTAAL</p>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-4xl font-bold">{totalOrders} orders</p>
                <p className="text-sm text-muted-foreground">
                  {totalTickets} tickets • €{totalRevenue.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6 pb-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">BETAALD</p>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-green-600">
                  {paidOrders}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paidOrders > 0
                    ? `€${orders
                        .filter((o) => o.paid)
                        .reduce((sum, o) => sum + o.totalPrice, 0)
                        .toFixed(2)} ontvangen`
                    : "Nog geen betalingen"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6 pb-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">NIET BETAALD</p>
                  <XCircle className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-4xl font-bold text-orange-600">
                  {unpaidOrders}
                </p>
                <p className="text-sm text-muted-foreground">
                  €{unpaidRevenue.toFixed(2)} openstaand
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek naam, email, order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "name" | "tickets")
                }
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="date">Nieuwste eerst</option>
                <option value="name">Naam A-Z</option>
                <option value="tickets">Meeste tickets</option>
              </select>

              <select
                value={filterReferer}
                onChange={(e) => setFilterReferer(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Alle verkopers</option>
                {uniqueReferers.map((ref, index) => (
                  <option key={`${ref}-${index}`} value={ref}>
                    {ref}
                  </option>
                ))}
              </select>

              <select
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Alle betalingen</option>
                <option value="paid">Betaald</option>
                <option value="unpaid">Onbetaald</option>
              </select>

              <Button variant="outline" onClick={exportToCSV} size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {sortedOrders.length}{" "}
              {sortedOrders.length === 1 ? "Bestelling" : "Bestellingen"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sortedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Geen bestellingen gevonden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                        NAAM
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                        EMAIL
                      </th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">
                        TICKETS
                      </th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">
                        BEDRAG
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                        VERKOPER
                      </th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">
                        DATUM
                      </th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground w-36">
                        STATUS
                      </th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">
                        ACTIES
                      </th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr
                          className={`transition-colors ${
                            order.paid
                              ? "bg-green-50/50 hover:bg-green-50 dark:bg-green-950/10 dark:hover:bg-green-950/20"
                              : "bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-950/10 dark:hover:bg-orange-950/20"
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-semibold">{order.name}</div>
                            {order.organization && (
                              <div className="text-xs text-muted-foreground">
                                🏢 {order.organization}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
                            {order.email}
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-semibold">
                              {order.ticketCount}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-semibold text-green-600">
                              €{order.totalPrice}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              {order.referer || "general"}
                            </span>
                          </td>
                          <td className="p-3 text-center text-sm text-muted-foreground hidden xl:table-cell">
                            {new Date(order.timestamp).toLocaleDateString(
                              "nl-NL",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              onClick={() => togglePaidStatus(order.id)}
                              variant={order.paid ? "default" : "outline"}
                              disabled={togglingOrderId !== null}
                              className={`w-full text-xs font-medium ${
                                order.paid
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
                              }`}
                            >
                              {togglingOrderId === order.id ? (
                                <>
                                  <div className="h-3 w-3 border-2 border-current/30 border-t-current rounded-full animate-spin mr-1" />
                                  Verwerken...
                                </>
                              ) : order.paid ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Betaald
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Niet betaald
                                </>
                              )}
                            </Button>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                openDeleteModal(order.id, order.name)
                              }
                              disabled={
                                togglingOrderId !== null || deletingOrder
                              }
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                              title="Verwijder bestelling"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                          <td className="p-3 text-center">
                            {order.ticketCount > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleExpanded(order.id)}
                                className="h-8 w-8 p-0"
                              >
                                {expandedOrders.has(order.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                        {expandedOrders.has(order.id) && (
                          <tr>
                            <td colSpan={9} className="p-0 bg-muted/10">
                              <div className="p-4 space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  EXTRA TICKETHOUDERS:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {order.additionalNames
                                    .filter((n) => n.trim())
                                    .map((name, idx) => (
                                      <div
                                        key={idx}
                                        className="text-sm bg-background border rounded px-3 py-2"
                                      >
                                        <span className="text-muted-foreground">
                                          #{idx + 2}
                                        </span>{" "}
                                        {name}
                                      </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t mt-3">
                                  <p className="text-xs text-muted-foreground font-mono">
                                    Order ID: {order.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && orderToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Bestelling verwijderen
                </h3>
                <p className="text-sm text-muted-foreground">
                  Weet je zeker dat je de bestelling van{" "}
                  <span className="font-semibold text-foreground">
                    {orderToDelete.name}
                  </span>{" "}
                  wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={deletingOrder}
              >
                Annuleren
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteOrder}
                disabled={deletingOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletingOrder ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verwijderen...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Verwijderen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeReminderModal}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Betalingsherinnering versturen
                </h3>
                <p className="text-sm text-muted-foreground">
                  Verstuur een reminder naar alle{" "}
                  <span className="font-semibold text-foreground">
                    {unpaidOrders} onbetaalde{" "}
                    {unpaidOrders === 1 ? "bestelling" : "bestellingen"}
                  </span>
                  .
                </p>
              </div>
              <button
                onClick={closeReminderModal}
                disabled={sendingReminders}
                className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Evenement naam</Label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="eventName"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Club44 2026"
                    className="pl-10"
                    disabled={sendingReminders}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Evenement datum</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="pl-10"
                    disabled={sendingReminders}
                  />
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Let op:</strong> Alle klanten met een onbetaalde
                  bestelling ontvangen een reminder email met hun
                  betaalgegevens.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={closeReminderModal}
                disabled={sendingReminders}
              >
                Annuleren
              </Button>
              <Button
                onClick={sendPaymentReminders}
                disabled={sendingReminders}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {sendingReminders ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Verstuur reminders
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
