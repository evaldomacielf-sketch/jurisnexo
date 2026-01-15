"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, CreditCard, Lock } from "lucide-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
    firmName: z.string().min(2, "Nome da firma deve ter pelo menos 2 caracteres"),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida (Use Hex)"),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida (Use Hex)").optional(),
    enabledPaymentMethods: z.array(z.string()).refine((value) => value.length > 0, {
        message: "Selecione pelo menos um método de pagamento.",
    }),
    defaultGateway: z.enum(["stripe", "asaas"]),
    stripePublicKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    asaasApiKey: z.string().optional(),
    asaasEnvironment: z.enum(["sandbox", "production"]).optional(),
    welcomeMessage: z.string().optional(),
    termsAndConditions: z.string().optional(),
});

export function PaymentPortalSettingsForm() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firmName: "",
            primaryColor: "#3B82F6",
            enabledPaymentMethods: ["pix", "credit_card", "boleto"],
            defaultGateway: "stripe",
            asaasEnvironment: "production",
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get("/finance/payment-portal/settings");
                if (response.data) {
                    // Map API response to form values
                    const settings = response.data;
                    form.reset({
                        firmName: settings.firm_name || "",
                        primaryColor: settings.primary_color || "#3B82F6",
                        secondaryColor: settings.secondary_color,
                        enabledPaymentMethods: settings.enabled_payment_methods || [],
                        defaultGateway: settings.default_gateway || "stripe",
                        stripePublicKey: settings.stripe_public_key || "",
                        // Don't pre-fill secret keys for security, or mask them
                        stripeSecretKey: settings.stripe_secret_key ? "********" : "",
                        asaasApiKey: settings.asaas_api_key ? "********" : "",
                        asaasEnvironment: settings.asaas_environment || "production",
                        welcomeMessage: settings.welcome_message || "",
                        termsAndConditions: settings.terms_and_conditions || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                // If it's a 404/not found, it means settings haven't been created yet, which is fine
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Remove masked keys if they weren't changed
            const payload = { ...values };
            if (payload.stripeSecretKey === "********") delete payload.stripeSecretKey;
            if (payload.asaasApiKey === "********") delete payload.asaasApiKey;

            await api.put("/finance/payment-portal/settings", payload);

            toast({
                title: "Configurações salvas",
                description: "As configurações do portal de pagamento foram atualizadas.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Erro ao salvar",
                description: "Ocorreu um erro ao atualizar as configurações.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="branding" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="branding">Marca e Aparência</TabsTrigger>
                        <TabsTrigger value="gateways">Gateways de Pagamento</TabsTrigger>
                        <TabsTrigger value="content">Mensagens e Termos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="branding">
                        <Card>
                            <CardHeader>
                                <CardTitle>Identidade Visual</CardTitle>
                                <CardDescription>
                                    Personalize como seus clientes veem o portal de pagamento.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="firmName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome da Empresa no Portal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Silva & Associados" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="primaryColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cor Primária</FormLabel>
                                                <div className="flex gap-2">
                                                    <Input type="color" className="w-12 h-10 p-1" {...field} />
                                                    <Input placeholder="#000000" {...field} />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gateways">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração de Pagamentos</CardTitle>
                                <CardDescription>
                                    Configure seus processadores de pagamento (Stripe ou Asaas).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="defaultGateway"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gateway Padrão</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o gateway" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="stripe">Stripe (Cartão Global)</SelectItem>
                                                    <SelectItem value="asaas">Asaas (Boleto/Pix Brasil)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                O gateway escolhido processará todas as novas transações.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="enabledPaymentMethods"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Métodos Aceitos</FormLabel>
                                                <FormDescription>
                                                    Selecione quais métodos de pagamento estarão disponíveis para os clientes.
                                                </FormDescription>
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                {["credit_card", "pix", "boleto"].map((item) => (
                                                    <FormField
                                                        key={item}
                                                        control={form.control}
                                                        name="enabledPaymentMethods"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={item}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(item)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, item])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== item
                                                                                        )
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal capitalize">
                                                                        {item.replace('_', ' ')}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" /> Configurações Stripe
                                    </h3>
                                    <div className="grid gap-4">
                                        <FormField
                                            control={form.control}
                                            name="stripePublicKey"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Public Key</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="pk_test_..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="stripeSecretKey"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Secret Key</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="password" placeholder="sk_test_..." {...field} />
                                                            <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="content">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mensagens e Termos</CardTitle>
                                <CardDescription>
                                    Defina o conteúdo textual exibido no checkout.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="welcomeMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensagem de Boas-vindas</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Obrigado por confiar em nossos serviços..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="termsAndConditions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Termos e Condições (Opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ao prosseguir com o pagamento, você concorda..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configurações
                    </Button>
                </div>
            </form>
        </Form>
    );
}
