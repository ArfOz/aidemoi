import { Repository, DataSource } from 'typeorm';
import { Company } from '../entities/Company';

export class CompanyService {
  private companyRepository: Repository<Company>;

  constructor(dataSource: DataSource) {
    this.companyRepository = dataSource.getRepository(Company);
  }

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async findById(id: number): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: { email }
    });
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(companyData);
    return await this.companyRepository.save(company);
  }

  async update(
    id: number,
    companyData: Partial<Company>
  ): Promise<Company | null> {
    await this.companyRepository.update(id, companyData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.companyRepository.delete(id);
    return result.affected !== 0;
  }

  async findCompanyUsers(id: number): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: { id }
    });
  }

  async getCompanyStats(id: number): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { id }
    });
    if (!company) return null;

    return {
      id: company.id,
      name: company.name,
      status: company.status,
      createdAt: company.createdAt
    };
  }
}
