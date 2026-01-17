export interface Versiculo {
    versiculo: number;
    texto: string;
}

export interface Capitulo {
    capitulo: number;
    versiculos: Versiculo[];
}

export interface Livro {
    nome: string;
    capitulos: Capitulo[];
}

// Agora, vamos adicionar a assinatura de índice à interface Biblia:
export interface Biblia {
    [key: string]: Livro[];  // Isso permite acessar 'antigoTestamento' e 'novoTestamento' dinamicamente
}
