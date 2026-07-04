import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity.js';
import { Client } from '../entities/client.entity.js';
import { Project } from '../entities/project.entity.js';
import { TimeEntry } from '../entities/time-entry.entity.js';
import { Invoice } from '../entities/invoice.entity.js';
import { InvoiceItem } from '../entities/invoice-item.entity.js';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async seed() {
    // Check if already seeded
    const existing = await this.userRepository.findOne({
      where: { email: 'demo@example.com' },
    });
    if (existing) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // --- Users ---
    const pwdHash = await bcrypt.hash('password123', 10);
    const ana = this.userRepository.create({
      email: 'demo@example.com',
      name: 'Ana García',
      passwordHash: pwdHash,
      defaultHourlyRate: 75,
      currency: 'USD',
    });
    const carlos = this.userRepository.create({
      email: 'carlos@example.com',
      name: 'Carlos López',
      passwordHash: pwdHash,
      defaultHourlyRate: 50,
      currency: 'USD',
    });
    await this.userRepository.save([ana, carlos]);

    // --- Clients ---
    const techCorp = this.clientRepository.create({
      name: 'TechCorp',
      email: 'billing@techcorp.com',
      phone: '+1-555-0100',
      company: 'TechCorp Inc.',
      notes: 'Enterprise client, prefers email invoices',
      userId: ana.id,
      user: ana,
    });
    const designStudio = this.clientRepository.create({
      name: 'DesignStudio',
      email: 'hello@designstudio.io',
      phone: '+1-555-0101',
      company: 'DesignStudio LLC',
      notes: 'Creative agency, monthly retainer',
      userId: ana.id,
      user: ana,
    });
    const freelance = this.clientRepository.create({
      name: 'Freelance Client',
      email: 'client@example.com',
      phone: null,
      company: null,
      notes: 'Hourly billing',
      userId: carlos.id,
      user: carlos,
    });
    await this.clientRepository.save([techCorp, designStudio, freelance]);

    // --- Projects ---
    const projects = [
      // TechCorp projects
      this.projectRepository.create({
        name: 'Website Redesign',
        description: 'Complete redesign of TechCorp website',
        hourlyRate: 100,
        currency: 'USD',
        status: 'active',
        userId: ana.id,
        user: ana,
        clientId: techCorp.id,
        client: techCorp,
      }),
      this.projectRepository.create({
        name: 'Mobile App Development',
        description: 'React Native mobile app',
        hourlyRate: 120,
        currency: 'USD',
        status: 'active',
        userId: ana.id,
        user: ana,
        clientId: techCorp.id,
        client: techCorp,
      }),
      this.projectRepository.create({
        name: 'API Integration',
        description: 'Third-party API integrations',
        hourlyRate: 90,
        currency: 'USD',
        status: 'completed',
        userId: ana.id,
        user: ana,
        clientId: techCorp.id,
        client: techCorp,
      }),
      // DesignStudio projects
      this.projectRepository.create({
        name: 'Brand Identity',
        description: 'Logo and brand guidelines',
        hourlyRate: 85,
        currency: 'USD',
        status: 'active',
        userId: ana.id,
        user: ana,
        clientId: designStudio.id,
        client: designStudio,
      }),
      this.projectRepository.create({
        name: 'Social Media Campaign',
        description: 'Q3 social media graphics',
        hourlyRate: 75,
        currency: 'USD',
        status: 'paused',
        userId: ana.id,
        user: ana,
        clientId: designStudio.id,
        client: designStudio,
      }),
    ];
    await this.projectRepository.save(projects);

    // --- Time Entries (last 14 days, 20+ entries) ---
    const now = new Date();
    const timeEntries: TimeEntry[] = [];
    const entryData = [
      { day: 0, hours: 3.5, desc: 'Homepage wireframes', projIdx: 0 },
      { day: 0, hours: 2.0, desc: 'Color palette exploration', projIdx: 3 },
      { day: 1, hours: 4.0, desc: 'React component library setup', projIdx: 1 },
      { day: 1, hours: 1.5, desc: 'Client meeting', projIdx: 0 },
      { day: 2, hours: 5.0, desc: 'API endpoint development', projIdx: 2 },
      { day: 2, hours: 2.0, desc: 'Logo sketches', projIdx: 3 },
      { day: 3, hours: 3.0, desc: 'Frontend integration', projIdx: 1 },
      { day: 3, hours: 2.5, desc: 'Website responsive fixes', projIdx: 0 },
      { day: 4, hours: 4.0, desc: 'Database schema design', projIdx: 2 },
      { day: 4, hours: 1.0, desc: 'Code review', projIdx: 1 },
      { day: 5, hours: 3.0, desc: 'Social media template design', projIdx: 4 },
      { day: 5, hours: 2.0, desc: 'Brand guidelines draft', projIdx: 3 },
      { day: 6, hours: 4.5, desc: 'Mobile app navigation', projIdx: 1 },
      { day: 6, hours: 1.5, desc: 'Weekly report', projIdx: 0 },
      { day: 7, hours: 2.0, desc: 'API documentation', projIdx: 2 },
      { day: 7, hours: 3.5, desc: 'UI component refinement', projIdx: 0 },
      { day: 8, hours: 4.0, desc: 'Push notifications setup', projIdx: 1 },
      { day: 9, hours: 3.0, desc: 'Social media graphics batch 1', projIdx: 4 },
      { day: 10, hours: 5.0, desc: 'Website performance optimization', projIdx: 0 },
      { day: 11, hours: 2.5, desc: 'Client presentation prep', projIdx: 3 },
      { day: 12, hours: 3.0, desc: 'Bug fixes', projIdx: 1 },
      { day: 13, hours: 4.0, desc: 'Final QA and deployment', projIdx: 0 },
    ];

    for (const ed of entryData) {
      const d = new Date(now);
      d.setDate(now.getDate() - ed.day);
      const dateStr = d.toISOString().split('T')[0];
      const proj = projects[ed.projIdx];
      timeEntries.push(
        this.timeEntryRepository.create({
          description: ed.desc,
          duration: ed.hours,
          date: dateStr,
          billable: true,
          invoiced: false,
          userId: ana.id,
          user: ana,
          projectId: proj.id,
          project: proj,
        }),
      );
    }
    await this.timeEntryRepository.save(timeEntries);

    // --- Invoices ---
    const inv1Items = [
      this.invoiceItemRepository.create({
        description: 'Website redesign - homepage',
        hours: 10,
        rate: 100,
        amount: 1000,
        sortOrder: 0,
      }),
      this.invoiceItemRepository.create({
        description: 'API integration work',
        hours: 8,
        rate: 90,
        amount: 720,
        sortOrder: 1,
      }),
    ];
    const inv1 = this.invoiceRepository.create({
      invoiceNumber: 'INV-2026-001',
      notes: 'Payment due within 30 days',
      taxRate: 0.1,
      subtotal: 1720,
      taxAmount: 172,
      total: 1892,
      status: 'draft',
      issueDate: '2026-06-01',
      dueDate: '2026-07-01',
      userId: ana.id,
      user: ana,
      clientId: techCorp.id,
      client: techCorp,
      invoiceItems: inv1Items,
    });

    const inv2Items = [
      this.invoiceItemRepository.create({
        description: 'Brand identity - logo design',
        hours: 15,
        rate: 85,
        amount: 1275,
        sortOrder: 0,
      }),
      this.invoiceItemRepository.create({
        description: 'Social media templates',
        hours: 5,
        rate: 75,
        amount: 375,
        sortOrder: 1,
      }),
    ];
    const inv2 = this.invoiceRepository.create({
      invoiceNumber: 'INV-2026-002',
      notes: 'Monthly retainer - June',
      taxRate: 0.08,
      subtotal: 1650,
      taxAmount: 132,
      total: 1782,
      status: 'sent',
      sentAt: '2026-06-15T10:00:00Z',
      issueDate: '2026-06-15',
      dueDate: '2026-07-15',
      userId: ana.id,
      user: ana,
      clientId: designStudio.id,
      client: designStudio,
      invoiceItems: inv2Items,
    });

    await this.invoiceRepository.save([inv1, inv2]);

    console.log('Seed completed successfully!');
    console.log(`  Users: 2 (demo@example.com / password123, carlos@example.com / password123)`);
    console.log(`  Clients: 3`);
    console.log(`  Projects: ${projects.length}`);
    console.log(`  Time Entries: ${timeEntries.length}`);
    console.log(`  Invoices: 2`);
  }
}
